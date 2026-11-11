"""Read-only U.S. Census County Business Patterns adapter.

Outputs are aggregate domestic-market statistics. They are not company leads,
open opportunities, eligibility findings, or procurement recommendations.
"""

from datetime import datetime, timezone
import json
from typing import Any, Callable, Dict, Iterable, List, Mapping, Optional
from urllib import error, parse, request

from .credentials import MissingRuntimeCredential, require_runtime_credential
from .discovery import attach_discovery_identity


CENSUS_API_KEY_ENV = "CENSUS_API_KEY"
CENSUS_BASE_URL = "https://api.census.gov/data"
CENSUS_DATASET = "cbp"
CENSUS_NAICS_VARIABLE = "NAICS2017"


class CensusApiError(RuntimeError):
    def __init__(self, status: int, category: str, message: str):
        super().__init__(message)
        self.status = status
        self.category = category


def build_census_cbp_params(
    *,
    state_fips: str,
    naics_code: str,
    api_key: str,
    county_fips: Optional[str] = "*",
    legal_form: str = "001",
    employment_size: str = "001",
) -> Dict[str, str]:
    if not (state_fips.isdigit() and len(state_fips) == 2):
        raise ValueError("state_fips must be a two-digit Census code")
    if county_fips not in (None, "*") and not (county_fips.isdigit() and len(county_fips) == 3):
        raise ValueError("county_fips must be '*', None, or a three-digit Census code")
    if not naics_code:
        raise ValueError("naics_code is required")
    params = {
        "get": "NAME,NAICS2017_LABEL,ESTAB,EMP",
        CENSUS_NAICS_VARIABLE: str(naics_code),
        "LFO": str(legal_form),
        "EMPSZES": str(employment_size),
        "key": api_key,
    }
    if county_fips is None:
        params["for"] = f"state:{state_fips}"
    else:
        params["for"] = f"county:{county_fips}"
        params["in"] = f"state:{state_fips}"
    return params


def _default_transport(endpoint: str, params: Mapping[str, str]) -> Any:
    req = request.Request(
        endpoint + "?" + parse.urlencode(params),
        headers={"Accept": "application/json", "User-Agent": "ShieldMate-Census-ReadOnly/1.0"},
    )
    try:
        with request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        category = "CREDENTIALS_OR_QUOTA" if exc.code in {401, 403, 429} else "SOURCE_HTTP_ERROR"
        raise CensusApiError(exc.code, category, f"Census request failed: {category}") from exc
    except error.URLError as exc:
        raise CensusApiError(0, "SOURCE_NETWORK_ERROR", "Census request failed: SOURCE_NETWORK_ERROR") from exc


def _integer(value: Any) -> Optional[int]:
    if value in (None, "", "N", "S", "D"):
        return None
    try:
        return int(str(value))
    except (TypeError, ValueError):
        return None


def normalize_census_cbp_rows(
    payload: Any,
    *,
    vintage: int,
    retrieved_at: Optional[str] = None,
) -> List[Dict[str, Any]]:
    if not isinstance(payload, list) or not payload or not isinstance(payload[0], list):
        raise ValueError("Census response must be a header row followed by data rows")
    headers = [str(value) for value in payload[0]]
    if len(headers) != len(set(headers)):
        raise ValueError("Census response contains duplicate headers")
    required = {"NAME", "NAICS2017_LABEL", "ESTAB", CENSUS_NAICS_VARIABLE, "state"}
    missing = sorted(required - set(headers))
    if missing:
        raise ValueError(f"Census response missing required columns: {', '.join(missing)}")
    retrieved_at = retrieved_at or datetime.now(timezone.utc).isoformat()
    records: List[Dict[str, Any]] = []
    for values in payload[1:]:
        if not isinstance(values, list) or len(values) != len(headers):
            raise ValueError("Census response row width does not match the header")
        original = dict(zip(headers, values))
        county = str(original.get("county") or "STATE_TOTAL")
        stable_source_record_id = ":".join([
            str(vintage), "cbp", str(original["state"]), county,
            str(original[CENSUS_NAICS_VARIABLE]), str(original.get("LFO") or "ALL"),
            str(original.get("EMPSZES") or "ALL"),
        ])
        record: Dict[str, Any] = {
            "recordType": "AGGREGATE_MARKET_STATISTIC",
            "opportunityType": "DOMESTIC_MARKET_STATISTIC",
            "source": "U.S. Census Bureau Data API",
            "dataset": "County Business Patterns",
            "datasetVintage": int(vintage),
            "geographyName": original["NAME"],
            "stateFips": str(original["state"]),
            "countyFips": None if county == "STATE_TOTAL" else county,
            "industryClassification": CENSUS_NAICS_VARIABLE,
            "industryCode": str(original[CENSUS_NAICS_VARIABLE]),
            "industryLabel": original["NAICS2017_LABEL"],
            "establishments": _integer(original.get("ESTAB")),
            "employees": _integer(original.get("EMP")),
            "officialLink": f"{CENSUS_BASE_URL}/{vintage}/{CENSUS_DATASET}",
            "retrievedAt": retrieved_at,
            "sourceStatus": "OFFICIAL_AGGREGATE_STATISTICS",
            "actionableOpportunity": False,
            "identifiedCompanyLead": False,
            "humanReviewRequiredForBusinessUse": True,
            "original": original,
        }
        records.append(attach_discovery_identity(
            record,
            source_identifier=f"CENSUS:{vintage}:{CENSUS_DATASET}",
            stable_source_record_id=stable_source_record_id,
            content_fields=(
                "recordType", "datasetVintage", "geographyName", "stateFips", "countyFips",
                "industryClassification", "industryCode", "industryLabel", "establishments",
                "employees", "sourceStatus",
            ),
        ))
    return records


def fetch_census_cbp(
    *,
    vintage: int,
    state_fips: str,
    naics_code: str,
    county_fips: Optional[str] = "*",
    api_key: Optional[str] = None,
    transport: Optional[Callable[[str, Mapping[str, str]], Any]] = None,
    retrieved_at: Optional[str] = None,
) -> Dict[str, Any]:
    try:
        runtime_key = api_key if api_key is not None else require_runtime_credential(CENSUS_API_KEY_ENV)
    except MissingRuntimeCredential as exc:
        raise CensusApiError(0, "BLOCKED_CREDENTIALS", str(exc)) from exc
    if not str(runtime_key).strip():
        raise CensusApiError(0, "BLOCKED_CREDENTIALS", f"{CENSUS_API_KEY_ENV} is unavailable")
    endpoint = f"{CENSUS_BASE_URL}/{int(vintage)}/{CENSUS_DATASET}"
    params = build_census_cbp_params(
        state_fips=state_fips,
        county_fips=county_fips,
        naics_code=naics_code,
        api_key=runtime_key,
    )
    payload = (transport or _default_transport)(endpoint, params)
    records = normalize_census_cbp_rows(payload, vintage=vintage, retrieved_at=retrieved_at)
    return {
        "source": "U.S. Census Bureau Data API",
        "dataset": f"{vintage} County Business Patterns",
        "classification": "AGGREGATE_MARKET_STATISTICS_NOT_COMPANY_LEADS",
        "records": records,
        "recordCount": len(records),
        "writesPerformed": 0,
    }
