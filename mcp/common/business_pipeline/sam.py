"""SAM.gov Opportunities v2 read-only helpers.

API keys are accepted only as runtime values. Exceptions and result objects never
contain the key or a request URL containing it.
"""

from dataclasses import asdict, dataclass
from datetime import date, datetime
import json
import re
import time
from typing import Any, Callable, Dict, Iterable, List, Mapping, Optional, Tuple
from urllib import error, parse, request

from .credentials import MissingRuntimeCredential, require_runtime_credential

from .discovery import attach_discovery_identity


SAM_ENDPOINT = "https://api.sam.gov/opportunities/v2/search"
SAM_MAX_PAGE_SIZE = 1000
_QUERY_DATE = re.compile(r"^\d{2}/\d{2}/\d{4}$")


@dataclass(frozen=True)
class ParsedSourceDate:
    original: Any
    normalized: Optional[str]
    kind: str
    timezone: str
    valid: bool
    error: Optional[str] = None


@dataclass(frozen=True)
class SamWindow:
    start: date
    end: date

    def query_dates(self) -> Dict[str, str]:
        return {
            "postedFrom": format_sam_query_date(self.start),
            "postedTo": format_sam_query_date(self.end),
        }


class SamApiError(RuntimeError):
    def __init__(self, status: int, category: str, retryable: bool, message: str, diagnostic: Optional[Mapping[str, Any]] = None):
        super().__init__(message)
        self.status = status
        self.category = category
        self.retryable = retryable
        self.diagnostic = dict(diagnostic or {})


def redact_sam_diagnostic_text(value: str, *, secrets: Iterable[str] = ()) -> str:
    """Remove credential-like values from a bounded SAM error-body diagnostic."""
    text = value or ""
    for secret in secrets:
        if secret:
            text = text.replace(secret, "[REDACTED]")
    text = re.sub(r'(?i)(api[_-]?key["\'\s:=]+)[^"\'\s,&}]+', r"\1[REDACTED]", text)
    text = re.sub(r"(?i)(bearer\s+)[A-Za-z0-9._~-]+", r"\1[REDACTED]", text)
    text = re.sub(r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", "[REDACTED_JWT]", text)
    return text[:2048]


def format_sam_query_date(value: Any) -> str:
    """Return MM/dd/yyyy and reject ISO strings passed as request dates."""
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, date):
        return value.strftime("%m/%d/%Y")
    if isinstance(value, str):
        if not _QUERY_DATE.fullmatch(value):
            raise ValueError("SAM request dates must use MM/dd/yyyy")
        try:
            parsed = datetime.strptime(value, "%m/%d/%Y")
        except ValueError as exc:
            raise ValueError("SAM request date is not a valid calendar date") from exc
        if parsed.strftime("%m/%d/%Y") != value:
            raise ValueError("SAM request date must be zero-padded MM/dd/yyyy")
        return value
    raise TypeError("SAM request date must be a date, datetime, or MM/dd/yyyy string")


def parse_sam_response_date(value: Any) -> ParsedSourceDate:
    if value in (None, ""):
        return ParsedSourceDate(value, None, "missing", "unspecified", False, "missing date")
    if not isinstance(value, str):
        return ParsedSourceDate(value, None, "invalid", "unspecified", False, "date is not a string")
    raw = value.strip()
    try:
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
            parsed = date.fromisoformat(raw)
            return ParsedSourceDate(value, parsed.isoformat(), "date", "date-only", True)

        iso_candidate = raw[:-1] + "+00:00" if raw.endswith("Z") else raw
        parsed_dt = datetime.fromisoformat(iso_candidate)
        timezone_value = "unspecified"
        if parsed_dt.tzinfo is not None:
            timezone_value = parsed_dt.strftime("%z")
            if timezone_value:
                timezone_value = timezone_value[:3] + ":" + timezone_value[3:]
        normalized = parsed_dt.isoformat()
        return ParsedSourceDate(value, normalized, "timestamp", timezone_value, True)
    except ValueError:
        return ParsedSourceDate(value, None, "invalid", "unspecified", False, "unsupported response date format")


def _next_year_safe(value: date) -> date:
    try:
        return value.replace(year=value.year + 1)
    except ValueError:
        return value.replace(year=value.year + 1, day=28)


def validate_sam_date_window(start: date, end: date) -> None:
    if end < start:
        raise ValueError("SAM date window end precedes start")
    if end > _next_year_safe(start):
        raise ValueError("SAM date window exceeds one calendar year")


def chunk_sam_date_range(start: date, end: date) -> List[SamWindow]:
    """Create chronological, safe windows with one inclusive boundary overlap."""
    if end < start:
        raise ValueError("SAM date range end precedes start")
    windows: List[SamWindow] = []
    cursor = start
    while True:
        window_end = min(_next_year_safe(cursor), end)
        validate_sam_date_window(cursor, window_end)
        windows.append(SamWindow(cursor, window_end))
        if window_end >= end:
            break
        cursor = window_end
    return windows


def classify_http_status(status: int) -> Tuple[str, bool]:
    if status == 400:
        return "BAD_REQUEST", False
    if status == 401:
        return "CREDENTIALS_EXPIRED_OR_INVALID", False
    if status == 403:
        return "CREDENTIALS_FORBIDDEN_OR_QUOTA", False
    if status == 404:
        return "NO_DATA_OR_ENDPOINT", False
    if status == 429:
        return "QUOTA_EXHAUSTED", True
    if 500 <= status <= 599:
        return "SOURCE_SERVER_ERROR", True
    return "HTTP_ERROR", False


def _default_transport(endpoint: str, params: Mapping[str, Any]) -> Mapping[str, Any]:
    url = endpoint + "?" + parse.urlencode(params, doseq=True)
    req = request.Request(url, headers={"Accept": "application/json", "User-Agent": "ShieldMate-SAM-ReadOnly/1.0"})
    try:
        with request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        category, retryable = classify_http_status(exc.code)
        try:
            raw_body = exc.read(2048).decode("utf-8", errors="replace")
        except Exception:
            raw_body = ""
        diagnostic = {
            "status": exc.code,
            "category": category,
            "contentType": exc.headers.get("Content-Type") if exc.headers else None,
            "body": redact_sam_diagnostic_text(raw_body, secrets=(str(params.get("api_key") or ""),)),
            "requestUrlRetained": False,
        }
        raise SamApiError(exc.code, category, retryable, f"SAM request failed: {category}", diagnostic) from exc
    except error.URLError as exc:
        raise SamApiError(0, "SOURCE_CONNECTION_ERROR", True, "SAM connection failed", {"requestUrlRetained": False}) from exc


def normalize_sam_opportunity(record: Mapping[str, Any], *, retrieved_at: str) -> Dict[str, Any]:
    posted = parse_sam_response_date(record.get("postedDate"))
    response_deadline = parse_sam_response_date(
        record.get("responseDeadLine") if "responseDeadLine" in record else record.get("reponseDeadLine")
    )
    notice_id = str(record.get("noticeId") or "").strip()
    issues: List[str] = []
    if not notice_id:
        issues.append("missing_notice_id")
    if not posted.valid:
        issues.append("invalid_or_missing_posted_date")
    if not response_deadline.valid:
        issues.append("invalid_or_missing_response_deadline")
    normalized = {
        "source": "SAM.gov Opportunities v2",
        "sourceNoticeId": notice_id,
        "stableOpportunityId": f"SAM:{notice_id}" if notice_id else None,
        "opportunityType": "FEDERAL_SOLICITATION",
        "title": record.get("title"),
        "solicitationNumber": record.get("solicitationNumber"),
        "agency": record.get("fullParentPathName") or record.get("department"),
        "naics": record.get("naicsCode"),
        "psc": record.get("classificationCode"),
        "noticeType": record.get("type"),
        "setAside": record.get("typeOfSetAsideDescription") or record.get("setAside"),
        "active": record.get("active"),
        "officialLink": record.get("uiLink") or record.get("additionalInfoLink"),
        "postedDate": asdict(posted),
        "responseDeadline": asdict(response_deadline),
        "retrievedAt": retrieved_at,
        "original": dict(record),
        "normalizationIssues": issues,
    }
    if notice_id:
        return attach_discovery_identity(
            normalized,
            source_identifier="SAM.gov Opportunities v2",
            stable_source_record_id=notice_id,
            content_fields=(
                "title", "solicitationNumber", "agency", "naics", "psc", "noticeType",
                "setAside", "active", "officialLink", "postedDate", "responseDeadline",
            ),
        )
    return normalized


def fetch_sam_pages(
    *,
    api_key: Optional[str] = None,
    window: SamWindow,
    filters: Optional[Mapping[str, Any]] = None,
    transport: Optional[Callable[[str, Mapping[str, Any]], Mapping[str, Any]]] = None,
    page_size: int = SAM_MAX_PAGE_SIZE,
    max_retries: int = 2,
    checkpoint: Optional[Callable[[Mapping[str, Any]], None]] = None,
    retrieved_at: Optional[str] = None,
    start_offset: int = 0,
) -> Dict[str, Any]:
    if api_key is None:
        try:
            api_key = require_runtime_credential("SAM_API_KEY")
        except MissingRuntimeCredential as exc:
            raise SamApiError(0, "BLOCKED_CREDENTIALS", False, str(exc)) from exc
    if not api_key:
        raise SamApiError(0, "BLOCKED_CREDENTIALS", False, "SAM_API_KEY is unavailable")
    validate_sam_date_window(window.start, window.end)
    if not 1 <= page_size <= SAM_MAX_PAGE_SIZE:
        raise ValueError("SAM page_size must be between 1 and 1000")
    if start_offset < 0:
        raise ValueError("SAM start_offset cannot be negative")
    transport = transport or _default_transport
    retrieved_at = retrieved_at or datetime.utcnow().isoformat(timespec="seconds") + "Z"
    offset = start_offset
    total: Optional[int] = None
    seen: Dict[str, Dict[str, Any]] = {}
    pages = 0
    truncated = False
    warnings: List[str] = []

    while total is None or offset < total:
        params: Dict[str, Any] = {
            "api_key": api_key,
            "postedFrom": format_sam_query_date(window.start),
            "postedTo": format_sam_query_date(window.end),
            "limit": page_size,
            "offset": offset,
        }
        if filters:
            reserved = {"api_key", "postedFrom", "postedTo", "limit", "offset"}
            overlap = reserved & set(filters)
            if overlap:
                raise ValueError(f"SAM filters cannot override reserved parameters: {', '.join(sorted(overlap))}")
            for key in ("rdlfrom", "rdlto"):
                if key in filters:
                    format_sam_query_date(filters[key])
            params.update(filters)
        attempt = 0
        while True:
            try:
                payload = transport(SAM_ENDPOINT, params)
                break
            except SamApiError as exc:
                if not exc.retryable or attempt >= max_retries:
                    raise
                attempt += 1
                time.sleep(min(2 ** attempt, 4))
        if not isinstance(payload, Mapping):
            raise ValueError("Malformed SAM response: expected object")
        records = payload.get("opportunitiesData")
        if not isinstance(records, list):
            raise ValueError("Malformed SAM response: opportunitiesData must be a list")
        try:
            total = int(payload.get("totalRecords", len(records)))
            response_limit = int(payload.get("limit", page_size))
            response_offset = int(payload.get("offset", offset))
        except (TypeError, ValueError) as exc:
            raise ValueError("Malformed SAM pagination metadata") from exc
        if response_limit <= 0:
            raise ValueError("Malformed SAM pagination limit")
        pages += 1
        for raw in records:
            if not isinstance(raw, Mapping):
                warnings.append("discarded_non_object_record")
                continue
            normalized = normalize_sam_opportunity(raw, retrieved_at=retrieved_at)
            stable = normalized.get("stableOpportunityId")
            if not stable:
                warnings.append("discarded_record_without_notice_id")
                continue
            seen[str(stable)] = normalized
        next_offset = response_offset + response_limit
        if checkpoint:
            checkpoint({
                "postedFrom": params["postedFrom"],
                "postedTo": params["postedTo"],
                "nextOffset": next_offset,
                "totalRecords": total,
                "uniqueRecords": len(seen),
            })
        if not records and next_offset < total:
            truncated = True
            warnings.append("empty_page_before_total_records")
            break
        if next_offset <= offset:
            truncated = True
            warnings.append("non_advancing_pagination")
            break
        offset = next_offset

    return {
        "source": "SAM.gov Opportunities v2",
        "window": {"start": window.start.isoformat(), "end": window.end.isoformat()},
        "pageSize": page_size,
        "pages": pages,
        "reportedTotal": total,
        "uniqueRecords": len(seen),
        "truncated": truncated,
        "warnings": warnings,
        "records": list(seen.values()),
    }


def fetch_sam_date_range(
    *,
    api_key: Optional[str] = None,
    start: date,
    end: date,
    filters: Optional[Mapping[str, Any]] = None,
    transport: Optional[Callable[[str, Mapping[str, Any]], Mapping[str, Any]]] = None,
    page_size: int = SAM_MAX_PAGE_SIZE,
    completed_window_starts: Iterable[str] = (),
    checkpoint: Optional[Callable[[Mapping[str, Any]], None]] = None,
    retrieved_at: Optional[str] = None,
) -> Dict[str, Any]:
    """Fetch chronological windows, resume completed windows, and deduplicate overlap."""
    completed = set(completed_window_starts)
    unique: Dict[str, Dict[str, Any]] = {}
    window_results: List[Dict[str, Any]] = []
    any_truncated = False
    for window in chunk_sam_date_range(start, end):
        window_key = window.start.isoformat()
        if window_key in completed:
            window_results.append({"start": window_key, "end": window.end.isoformat(), "status": "SKIPPED_COMPLETED"})
            continue
        result = fetch_sam_pages(
            api_key=api_key,
            window=window,
            filters=filters,
            transport=transport,
            page_size=page_size,
            checkpoint=checkpoint,
            retrieved_at=retrieved_at,
        )
        for record in result["records"]:
            unique[record["stableOpportunityId"]] = record
        any_truncated = any_truncated or bool(result["truncated"])
        window_results.append({
            "start": window_key,
            "end": window.end.isoformat(),
            "status": "TRUNCATED" if result["truncated"] else "COMPLETE",
            "pages": result["pages"],
            "uniqueRecordsInWindow": result["uniqueRecords"],
        })
        if checkpoint:
            checkpoint({
                "completedWindowStart": window_key,
                "completedWindowEnd": window.end.isoformat(),
                "uniqueRecordsAcrossWindows": len(unique),
                "truncated": result["truncated"],
            })
    return {
        "source": "SAM.gov Opportunities v2",
        "range": {"start": start.isoformat(), "end": end.isoformat()},
        "windows": window_results,
        "uniqueRecords": len(unique),
        "truncated": any_truncated,
        "records": list(unique.values()),
    }

