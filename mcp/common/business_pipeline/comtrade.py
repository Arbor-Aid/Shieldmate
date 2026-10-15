"""Read-only UN Comtrade aggregate trade-flow adapter."""

from datetime import datetime, timezone
import json
from typing import Any, Callable, Dict, List, Mapping, Optional
from urllib import error, parse, request

from .credentials import MissingRuntimeCredential, require_runtime_credential
from .discovery import attach_discovery_identity


COMTRADE_API_KEY_ENV = "COMTRADE_API_KEY"
COMTRADE_SECONDARY_API_KEY_ENV = "COMTRADE_SECONDARY_API_KEY"
COMTRADE_ENDPOINT = "https://comtradeapi.un.org/data/v1/get/C/A/HS"
COMTRADE_AUTH_HEADER = "Ocp-Apim-Subscription-Key"
DEFAULT_MAX_RECORDS = 500
LOCAL_MAX_RECORDS = 1000


class ComtradeApiError(RuntimeError):
    def __init__(self, status: int, category: str, message: str):
        super().__init__(message)
        self.status = status
        self.category = category


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
        category = "CREDENTIALS_OR_QUOTA" if exc.code in {401, 403, 429} else "SOURCE_HTTP_ERROR"
        raise ComtradeApiError(exc.code, category, f"UN Comtrade request failed: {category}") from exc
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
) -> Dict[str, Any]:
    try:
        runtime_key = api_key if api_key is not None else require_runtime_credential(COMTRADE_API_KEY_ENV)
    except MissingRuntimeCredential as exc:
        raise ComtradeApiError(0, "BLOCKED_CREDENTIALS", str(exc)) from exc
    if not str(runtime_key).strip():
        raise ComtradeApiError(0, "BLOCKED_CREDENTIALS", f"{COMTRADE_API_KEY_ENV} is unavailable")
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
    payload = (transport or _default_transport)(COMTRADE_ENDPOINT, params, headers)
    records = normalize_comtrade_rows(payload, retrieved_at=retrieved_at)
    return {
        "source": "UN Comtrade API",
        "classification": "AGGREGATE_TRADE_FLOW_STATISTICS_NOT_COMPANY_LEADS",
        "subscriptionMode": "OWNER_MANAGED_PRIMARY_KEY",
        "secondaryKeyUsed": False,
        "records": records,
        "recordCount": len(records),
        "writesPerformed": 0,
    }
