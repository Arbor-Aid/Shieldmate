"""Read-only USAspending contract-award intelligence adapter."""

from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Mapping, Optional
from urllib import request

from .discovery import attach_discovery_identity


USASPENDING_ENDPOINT = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
CONTRACT_AWARD_TYPE_CODES = ["A", "B", "C", "D"]
DEFAULT_FIELDS = [
    "Award ID",
    "Recipient Name",
    "Start Date",
    "End Date",
    "Award Amount",
    "Awarding Agency",
    "Awarding Sub Agency",
    "Contract Award Type",
    "NAICS",
    "PSC",
    "Description",
    "Last Modified Date",
]


def build_award_request(start_date: str, end_date: str, *, page: int = 1, limit: int = 10) -> Dict[str, Any]:
    if page < 1 or limit < 1:
        raise ValueError("USAspending page and limit must be positive")
    return {
        "subawards": False,
        "limit": limit,
        "page": page,
        "filters": {
            "award_type_codes": CONTRACT_AWARD_TYPE_CODES,
            "time_period": [{"start_date": start_date, "end_date": end_date}],
        },
        "fields": DEFAULT_FIELDS,
        "sort": "Last Modified Date",
        "order": "desc",
    }


def _post_json(url: str, payload: Mapping[str, Any]) -> Mapping[str, Any]:
    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json", "User-Agent": "ShieldMate-USAspending-ReadOnly/1.0"},
    )
    with request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_award(record: Mapping[str, Any], *, retrieved_at: str) -> Dict[str, Any]:
    award_id = str(record.get("Award ID") or "").strip()
    normalized = {
        "source": "USAspending",
        "stableOpportunityId": f"USASPENDING:{award_id}" if award_id else None,
        "opportunityType": "HISTORICAL_AWARD_INTELLIGENCE",
        "awardId": award_id,
        "recipientName": record.get("Recipient Name"),
        "awardingAgency": record.get("Awarding Agency"),
        "awardingSubAgency": record.get("Awarding Sub Agency"),
        "description": record.get("Description"),
        "naics": record.get("NAICS"),
        "psc": record.get("PSC"),
        "startDate": record.get("Start Date"),
        "endDate": record.get("End Date"),
        "awardAmount": record.get("Award Amount"),
        "lastModifiedDate": record.get("Last Modified Date"),
        "retrievedAt": retrieved_at,
        "intelligenceStatus": "HISTORICAL_AWARD_NOT_ACTIVE_OPPORTUNITY",
        "original": dict(record),
    }
    if award_id:
        return attach_discovery_identity(
            normalized,
            source_identifier="USAspending",
            stable_source_record_id=award_id,
            content_fields=(
                "recipientName", "awardingAgency", "awardingSubAgency", "description", "naics",
                "psc", "startDate", "endDate", "awardAmount", "lastModifiedDate", "intelligenceStatus",
            ),
        )
    return normalized


def fetch_award_intelligence(
    start_date: str,
    end_date: str,
    *,
    limit: int = 10,
    max_pages: int = 1,
    transport=_post_json,
) -> Dict[str, Any]:
    retrieved_at = datetime.now(timezone.utc).isoformat()
    page = 1
    pages_fetched = 0
    records: List[Dict[str, Any]] = []
    has_next = False
    while page <= max_pages:
        payload = transport(USASPENDING_ENDPOINT, build_award_request(start_date, end_date, page=page, limit=limit))
        pages_fetched += 1
        raw_results = payload.get("results")
        metadata = payload.get("page_metadata")
        if not isinstance(raw_results, list) or not isinstance(metadata, Mapping):
            raise ValueError("Malformed USAspending response")
        records.extend(normalize_award(item, retrieved_at=retrieved_at) for item in raw_results if isinstance(item, Mapping))
        has_next = bool(metadata.get("hasNext") if "hasNext" in metadata else metadata.get("has_next_page"))
        if not has_next:
            break
        page += 1
    return {
        "source": "USAspending",
        "endpoint": USASPENDING_ENDPOINT,
        "retrievedAt": retrieved_at,
        "records": records,
        "pagesFetched": pages_fetched,
        "truncated": has_next and pages_fetched >= max_pages,
        "warning": "Historical awards are market intelligence, not active bid opportunities.",
    }

