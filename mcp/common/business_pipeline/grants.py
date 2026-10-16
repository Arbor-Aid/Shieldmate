"""Read-only Grants.gov public opportunity search adapter."""

from datetime import datetime, timezone
import json
from typing import Any, Callable, Dict, List, Mapping, Optional
from urllib import error, request

from .discovery import attach_discovery_identity


GRANTS_SEARCH_ENDPOINT = "https://api.grants.gov/v1/api/search2"
GRANTS_DETAIL_ENDPOINT = "https://api.grants.gov/v1/api/fetchOpportunity"


class GrantsApiError(RuntimeError):
    def __init__(self, status: int, category: str, message: str):
        super().__init__(message)
        self.status = status
        self.category = category


def build_grants_search_request(
    *,
    keyword: str = "",
    rows: int = 25,
    start_record: int = 0,
    opportunity_statuses: str = "forecasted|posted",
) -> Dict[str, Any]:
    if not 1 <= rows <= 1000:
        raise ValueError("Grants.gov rows must be between 1 and 1000")
    if start_record < 0:
        raise ValueError("Grants.gov start_record cannot be negative")
    return {
        "keyword": keyword,
        "rows": rows,
        "startRecordNum": start_record,
        "oppStatuses": opportunity_statuses,
    }


def _post_json(endpoint: str, payload: Mapping[str, Any]) -> Mapping[str, Any]:
    req = request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json", "User-Agent": "ShieldMate-Grants-ReadOnly/1.0"},
    )
    try:
        with request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        category = "RATE_LIMITED" if exc.code == 429 else ("SOURCE_SERVER_ERROR" if exc.code >= 500 else "HTTP_ERROR")
        raise GrantsApiError(exc.code, category, f"Grants.gov request failed: {category}") from exc
    except error.URLError as exc:
        raise GrantsApiError(0, "SOURCE_CONNECTION_ERROR", "Grants.gov connection failed") from exc


def _normalize_grants_date(value: Any) -> Optional[str]:
    if not value:
        return None
    text = str(value).strip()
    for fmt in ("%m/%d/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def normalize_grant_opportunity(record: Mapping[str, Any], *, retrieved_at: str) -> Dict[str, Any]:
    opportunity_id = str(record.get("id") or "").strip()
    opportunity_number = str(record.get("number") or "").strip()
    stable_id = opportunity_id or opportunity_number
    if not stable_id:
        raise ValueError("Grants.gov opportunity is missing id and number")
    normalized = {
        "source": "Grants.gov",
        "sourceNoticeId": opportunity_number or opportunity_id,
        "stableOpportunityId": f"GRANTS:{stable_id}",
        "opportunityType": "GRANT_OPPORTUNITY",
        "title": record.get("title"),
        "agency": record.get("agency"),
        "agencyCode": record.get("agencyCode"),
        "assistanceListings": list(record.get("cfdaList") or []),
        "opportunityStatus": record.get("oppStatus"),
        "documentType": record.get("docType"),
        "postedDate": {"original": record.get("openDate"), "normalized": _normalize_grants_date(record.get("openDate"))},
        "responseDeadline": {"original": record.get("closeDate"), "normalized": _normalize_grants_date(record.get("closeDate"))},
        "officialLink": f"https://www.grants.gov/search-results-detail/{opportunity_number}" if opportunity_number else GRANTS_DETAIL_ENDPOINT,
        "sourceApiUrl": GRANTS_SEARCH_ENDPOINT,
        "retrievedAt": retrieved_at,
        "eligibilityDecision": "UNDETERMINED_REQUIRES_ENTITY_REVIEW",
        "original": dict(record),
    }
    return attach_discovery_identity(
        normalized,
        source_identifier="Grants.gov",
        stable_source_record_id=stable_id,
        content_fields=(
            "sourceNoticeId", "title", "agency", "agencyCode", "assistanceListings",
            "opportunityStatus", "documentType", "postedDate", "responseDeadline", "officialLink",
        ),
    )


def fetch_grants_pages(
    *,
    keyword: str = "",
    rows: int = 25,
    max_pages: int = 1,
    opportunity_statuses: str = "forecasted|posted",
    transport: Callable[[str, Mapping[str, Any]], Mapping[str, Any]] = _post_json,
    retrieved_at: Optional[str] = None,
) -> Dict[str, Any]:
    if max_pages < 1:
        raise ValueError("max_pages must be positive")
    retrieved_at = retrieved_at or datetime.now(timezone.utc).isoformat()
    start = 0
    pages = 0
    hit_count: Optional[int] = None
    records: Dict[str, Dict[str, Any]] = {}
    truncated = False
    while pages < max_pages:
        payload = transport(
            GRANTS_SEARCH_ENDPOINT,
            build_grants_search_request(keyword=keyword, rows=rows, start_record=start, opportunity_statuses=opportunity_statuses),
        )
        if not isinstance(payload, Mapping) or payload.get("errorcode") not in (0, "0", None):
            raise ValueError("Malformed or unsuccessful Grants.gov response")
        data = payload.get("data")
        if not isinstance(data, Mapping) or not isinstance(data.get("oppHits"), list):
            raise ValueError("Malformed Grants.gov response: data.oppHits is required")
        try:
            hit_count = int(data.get("hitCount", len(data["oppHits"])))
            observed_start = int(data.get("startRecord", start))
        except (TypeError, ValueError) as exc:
            raise ValueError("Malformed Grants.gov pagination metadata") from exc
        pages += 1
        for raw in data["oppHits"]:
            if not isinstance(raw, Mapping):
                continue
            normalized = normalize_grant_opportunity(raw, retrieved_at=retrieved_at)
            records[normalized["identityHash"]] = normalized
        next_start = observed_start + rows
        if not data["oppHits"] or next_start >= hit_count:
            truncated = False
            break
        start = next_start
    else:
        truncated = hit_count is not None and start < hit_count
    return {
        "source": "Grants.gov",
        "endpoint": GRANTS_SEARCH_ENDPOINT,
        "retrievedAt": retrieved_at,
        "pagesFetched": pages,
        "reportedTotal": hit_count,
        "uniqueRecords": len(records),
        "truncated": truncated,
        "records": list(records.values()),
        "responseTokenRetained": False,
    }


def fetch_grant_opportunity_detail(
    opportunity_id: str,
    *,
    transport: Callable[[str, Mapping[str, Any]], Mapping[str, Any]] = _post_json,
    retrieved_at: Optional[str] = None,
) -> Dict[str, Any]:
    """Fetch public detail data while discarding response/session tokens."""
    opportunity_id = str(opportunity_id or "").strip()
    if not opportunity_id:
        raise ValueError("Grants.gov opportunity_id is required")
    payload = transport(GRANTS_DETAIL_ENDPOINT, {"oppId": opportunity_id})
    if not isinstance(payload, Mapping) or payload.get("errorcode") not in (0, "0", None):
        raise ValueError("Malformed or unsuccessful Grants.gov detail response")
    data = payload.get("data")
    if not isinstance(data, Mapping):
        raise ValueError("Malformed Grants.gov detail response: data object is required")
    backend_message = data.get("message")
    if isinstance(backend_message, str) and "not available" in backend_message.casefold():
        raise GrantsApiError(200, "UPSTREAM_BACKEND_UNAVAILABLE", "Grants.gov detail backend is unavailable")
    return {
        "source": "Grants.gov",
        "endpoint": GRANTS_DETAIL_ENDPOINT,
        "opportunityId": opportunity_id,
        "retrievedAt": retrieved_at or datetime.now(timezone.utc).isoformat(),
        "data": dict(data),
        "responseTokenRetained": False,
    }
