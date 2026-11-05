"""Read-only UN Comtrade aggregate trade-flow adapter.

The adapter uses only the owner-selected primary key.  A process-local request
budget and bounded 429 retries protect the provider quota without treating a
secondary credential as an automatic failover mechanism.
"""

from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import json
import re
import threading
import time
from typing import Any, Callable, Dict, Iterable, List, Mapping, Optional
from urllib import error, parse, request

from .credentials import MissingRuntimeCredential, require_runtime_credential
from .discovery import attach_discovery_identity


COMTRADE_API_KEY_ENV = "COMTRADE_API_KEY"
COMTRADE_SECONDARY_API_KEY_ENV = "COMTRADE_SECONDARY_API_KEY"
COMTRADE_ENDPOINT = "https://comtradeapi.un.org/data/v1/get/C/A/HS"
COMTRADE_AUTH_HEADER = "Ocp-Apim-Subscription-Key"
DEFAULT_MAX_RECORDS = 500
LOCAL_MAX_RECORDS = 1000
PROVIDER_DAILY_CALL_CEILING = 500
DEFAULT_DAILY_REQUEST_LIMIT = 450
DEFAULT_MAX_RETRIES = 2
MAX_RETRY_COUNT = 3
DEFAULT_MAX_RETRY_DELAY_SECONDS = 8.0
HARD_MAX_RETRY_DELAY_SECONDS = 60.0


class ComtradeApiError(RuntimeError):
    def __init__(
        self,
        status: int,
        category: str,
        message: str,
        *,
        retry_after_seconds: Optional[float] = None,
    ):
        super().__init__(message)
        self.status = status
        self.category = category
        self.retry_after_seconds = retry_after_seconds


class ComtradeDailyBudget:
    """In-memory UTC-day request counter; no usage or credential data persists."""

    def __init__(
        self,
        limit: int = DEFAULT_DAILY_REQUEST_LIMIT,
        *,
        utc_now: Optional[Callable[[], datetime]] = None,
    ):
        if isinstance(limit, bool) or not isinstance(limit, int):
            raise TypeError("Comtrade daily request limit must be an integer")
        if not 1 <= limit <= PROVIDER_DAILY_CALL_CEILING:
            raise ValueError(
                f"Comtrade daily request limit must be between 1 and {PROVIDER_DAILY_CALL_CEILING}"
            )
        self.limit = limit
        self._utc_now = utc_now or (lambda: datetime.now(timezone.utc))
        self._day = None
        self._used = 0
        self._lock = threading.Lock()

    def _current_utc_day(self):
        current = self._utc_now()
        if not isinstance(current, datetime) or current.tzinfo is None:
            raise ComtradeApiError(0, "BLOCKED_CLOCK", "UN Comtrade UTC clock is unavailable")
        return current.astimezone(timezone.utc).date()

    def reserve(self) -> None:
        with self._lock:
            current_day = self._current_utc_day()
            if current_day != self._day:
                self._day = current_day
                self._used = 0
            if self._used >= self.limit:
                raise ComtradeApiError(
                    0,
                    "BLOCKED_DAILY_BUDGET",
                    "UN Comtrade local daily request budget is exhausted",
                )
            self._used += 1

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            current_day = self._current_utc_day()
            used = self._used if current_day == self._day else 0
            return {
                "utcDay": current_day.isoformat(),
                "limit": self.limit,
                "used": used,
                "remaining": self.limit - used,
            }


_DEFAULT_REQUEST_BUDGET = ComtradeDailyBudget()


def redact_comtrade_text(value: str, *, secrets: Iterable[str] = ()) -> str:
    text = str(value or "")
    for secret in secrets:
        if secret:
            text = text.replace(secret, "[REDACTED]")
    text = re.sub(
        r'(?i)((?:subscription|api)[_-]?key["\'\s:=]+)[^"\'\s,&}]+',
        r"\1[REDACTED]",
        text,
    )
    text = re.sub(r"(?i)(bearer\s+)[A-Za-z0-9._~-]+", r"\1[REDACTED]", text)
    return text[:2048]


def _redact_secret_values(value: Any, *, secrets: Iterable[str]) -> Any:
    if isinstance(value, Mapping):
        return {key: _redact_secret_values(item, secrets=secrets) for key, item in value.items()}
    if isinstance(value, list):
        return [_redact_secret_values(item, secrets=secrets) for item in value]
    if isinstance(value, tuple):
        return tuple(_redact_secret_values(item, secrets=secrets) for item in value)
    if isinstance(value, str):
        return redact_comtrade_text(value, secrets=secrets)
    return value


def _parse_retry_after(value: Any, *, now: Optional[datetime] = None) -> Optional[float]:
    raw = str(value or "").strip()
    if not raw:
        return None
    if re.fullmatch(r"\d+", raw):
        return float(raw)
    try:
        retry_at = parsedate_to_datetime(raw)
        if retry_at.tzinfo is None:
            return None
        current = now or datetime.now(timezone.utc)
        if current.tzinfo is None:
            return None
        return max(0.0, (retry_at - current.astimezone(timezone.utc)).total_seconds())
    except (TypeError, ValueError, OverflowError):
        return None


def build_comtrade_params(
    *,
    period: int,
    reporter_code: int,
    partner_code: int,
    flow_code: str,
    commodity_code: str,
    max_records: int = DEFAULT_MAX_RECORDS,
) -> Dict[str, Any]:
    if not 1 <= int(max_records) <= LOCAL_MAX_RECORDS:
        raise ValueError(f"max_records must be between 1 and {LOCAL_MAX_RECORDS} for local bounded reads")
    if not str(flow_code).strip() or not str(commodity_code).strip():
        raise ValueError("flow_code and commodity_code are required")
    return {
        "period": int(period),
        "reporterCode": int(reporter_code),
        "partnerCode": int(partner_code),
        "flowCode": str(flow_code),
        "cmdCode": str(commodity_code),
        "maxRecords": int(max_records),
    }


def _default_transport(endpoint: str, params: Mapping[str, Any], headers: Mapping[str, str]) -> Any:
    req = request.Request(endpoint + "?" + parse.urlencode(params), headers=dict(headers))
    try:
        with request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        category = "RATE_LIMITED" if exc.code == 429 else (
            "CREDENTIALS_OR_QUOTA" if exc.code in {401, 403} else "SOURCE_HTTP_ERROR"
        )
        retry_after = _parse_retry_after(exc.headers.get("Retry-After") if exc.headers else None)
        raise ComtradeApiError(
            exc.code,
            category,
            f"UN Comtrade request failed: {category}",
            retry_after_seconds=retry_after,
        ) from exc
    except error.URLError as exc:
        raise ComtradeApiError(0, "SOURCE_NETWORK_ERROR", "UN Comtrade request failed: SOURCE_NETWORK_ERROR") from exc


def _number(value: Any) -> Optional[Any]:
    if value in (None, ""):
        return None
    try:
        number = float(value)
        return int(number) if number.is_integer() else number
    except (TypeError, ValueError):
        return None


def normalize_comtrade_rows(
    payload: Mapping[str, Any],
    *,
    retrieved_at: Optional[str] = None,
) -> List[Dict[str, Any]]:
    rows = payload.get("data")
    if not isinstance(rows, list):
        raise ValueError("UN Comtrade response lacks a data array")
    retrieved_at = retrieved_at or datetime.now(timezone.utc).isoformat()
    records: List[Dict[str, Any]] = []
    for original in rows:
        if not isinstance(original, Mapping):
            raise ValueError("UN Comtrade data rows must be objects")
        period = original.get("period") or original.get("refYear")
        classification = original.get("classificationCode") or original.get("clCode") or "HS"
        parts = [
            classification, period, original.get("reporterCode"), original.get("partnerCode"),
            original.get("flowCode"), original.get("cmdCode"), original.get("partner2Code"),
            original.get("customsCode"), original.get("motCode"), original.get("aggregateLevel"),
        ]
        if any(value in (None, "") for value in parts[:6]):
            raise ValueError("UN Comtrade row lacks stable classification/period/party/flow/commodity fields")
        stable_source_record_id = ":".join(str(value if value not in (None, "") else "NA") for value in parts)
        record: Dict[str, Any] = {
            "recordType": "AGGREGATE_TRADE_FLOW_STATISTIC",
            "opportunityType": "INTERNATIONAL_TRADE_FLOW_STATISTIC",
            "source": "UN Comtrade API",
            "period": str(period),
            "reporterCode": str(original.get("reporterCode")),
            "reporterName": original.get("reporterDesc"),
            "partnerCode": str(original.get("partnerCode")),
            "partnerName": original.get("partnerDesc"),
            "flowCode": str(original.get("flowCode")),
            "flowDescription": original.get("flowDesc"),
            "classificationVersion": str(classification),
            "commodityCode": str(original.get("cmdCode")),
            "commodityDescription": original.get("cmdDesc"),
            "tradeValue": _number(original.get("primaryValue")),
            "netWeightKg": _number(original.get("netWgt")),
            "quantity": _number(original.get("qty")),
            "quantityUnitCode": original.get("qtyUnitCode"),
            "officialLink": "https://comtradeplus.un.org/",
            "retrievedAt": retrieved_at,
            "sourceStatus": "OFFICIAL_AGGREGATE_TRADE_STATISTICS",
            "actionableOpportunity": False,
            "identifiedCompanyLead": False,
            "tariffClassificationDetermination": False,
            "regulatoryApproval": False,
            "humanReviewRequiredForBusinessUse": True,
            "original": dict(original),
        }
        records.append(attach_discovery_identity(
            record,
            source_identifier="UN_COMTRADE:C:A:HS",
            stable_source_record_id=stable_source_record_id,
            content_fields=(
                "recordType", "period", "reporterCode", "reporterName", "partnerCode",
                "partnerName", "flowCode", "flowDescription", "classificationVersion",
                "commodityCode", "commodityDescription", "tradeValue", "netWeightKg",
                "quantity", "quantityUnitCode", "sourceStatus",
            ),
        ))
    return records


def fetch_comtrade_statistics(
    *,
    period: int,
    reporter_code: int,
    partner_code: int,
    flow_code: str,
    commodity_code: str,
    max_records: int = DEFAULT_MAX_RECORDS,
    api_key: Optional[str] = None,
    transport: Optional[Callable[[str, Mapping[str, Any], Mapping[str, str]], Any]] = None,
    retrieved_at: Optional[str] = None,
    request_budget: Optional[ComtradeDailyBudget] = None,
    max_retries: int = DEFAULT_MAX_RETRIES,
    retry_base_delay_seconds: float = 1.0,
    max_retry_delay_seconds: float = DEFAULT_MAX_RETRY_DELAY_SECONDS,
    sleep: Callable[[float], None] = time.sleep,
) -> Dict[str, Any]:
    try:
        runtime_key = api_key if api_key is not None else require_runtime_credential(COMTRADE_API_KEY_ENV)
    except MissingRuntimeCredential as exc:
        raise ComtradeApiError(0, "BLOCKED_CREDENTIALS", str(exc)) from exc
    if not str(runtime_key).strip():
        raise ComtradeApiError(0, "BLOCKED_CREDENTIALS", f"{COMTRADE_API_KEY_ENV} is unavailable")
    runtime_key = str(runtime_key).strip()
    if isinstance(max_retries, bool) or not isinstance(max_retries, int) or not 0 <= max_retries <= MAX_RETRY_COUNT:
        raise ValueError(f"max_retries must be between 0 and {MAX_RETRY_COUNT}")
    if not 0 < float(retry_base_delay_seconds) <= HARD_MAX_RETRY_DELAY_SECONDS:
        raise ValueError("retry_base_delay_seconds is outside the bounded range")
    if not 0 < float(max_retry_delay_seconds) <= HARD_MAX_RETRY_DELAY_SECONDS:
        raise ValueError("max_retry_delay_seconds is outside the bounded range")
    params = build_comtrade_params(
        period=period,
        reporter_code=reporter_code,
        partner_code=partner_code,
        flow_code=flow_code,
        commodity_code=commodity_code,
        max_records=max_records,
    )
    headers = {
        "Accept": "application/json",
        "User-Agent": "ShieldMate-Comtrade-ReadOnly/1.0",
        COMTRADE_AUTH_HEADER: runtime_key,
    }
    selected_transport = transport or _default_transport
    budget = request_budget or _DEFAULT_REQUEST_BUDGET
    attempt = 0
    while True:
        budget.reserve()
        try:
            payload = selected_transport(COMTRADE_ENDPOINT, params, headers)
            break
        except ComtradeApiError as exc:
            sanitized = ComtradeApiError(
                exc.status,
                exc.category,
                f"UN Comtrade request failed: {exc.category}",
                retry_after_seconds=exc.retry_after_seconds,
            )
            if exc.status != 429 or attempt >= max_retries:
                raise sanitized from exc
            fallback_delay = float(retry_base_delay_seconds) * (2 ** attempt)
            requested_delay = (
                exc.retry_after_seconds
                if exc.retry_after_seconds is not None and exc.retry_after_seconds >= 0
                else fallback_delay
            )
            sleep(min(float(requested_delay), float(max_retry_delay_seconds)))
            attempt += 1
        except Exception as exc:
            raise ComtradeApiError(
                0,
                "SOURCE_NETWORK_ERROR",
                "UN Comtrade request failed: SOURCE_NETWORK_ERROR",
            ) from exc
    payload = _redact_secret_values(payload, secrets=(runtime_key,))
    records = normalize_comtrade_rows(payload, retrieved_at=retrieved_at)
    return {
        "source": "UN Comtrade API",
        "classification": "AGGREGATE_TRADE_FLOW_STATISTICS_NOT_COMPANY_LEADS",
        "subscriptionMode": "OWNER_MANAGED_PRIMARY_KEY",
        "secondaryKeyUsed": False,
        "requestAttempts": attempt + 1,
        "dailyBudget": budget.snapshot(),
        "records": records,
        "recordCount": len(records),
        "writesPerformed": 0,
    }
