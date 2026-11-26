import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.census import (
    CensusApiError,
    build_census_cbp_params,
    fetch_census_cbp,
    normalize_census_cbp_rows,
)
from business_pipeline.discovery import reconcile_batch
from business_pipeline.workflow import route_discovery_record


FIXTURE = Path(__file__).parent / "fixtures" / "market_statistics.synthetic.json"


class CensusTests(unittest.TestCase):
    def test_county_query_and_normalization_remain_market_statistics(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["census"]
        records = normalize_census_cbp_rows(fixture, vintage=2023, retrieved_at="2026-10-15T00:00:00Z")
        record = records[0]
        self.assertEqual(record["recordType"], "AGGREGATE_MARKET_STATISTIC")
        self.assertFalse(record["actionableOpportunity"])
        self.assertFalse(record["identifiedCompanyLead"])
        self.assertEqual(record["countyFips"], "161")
        self.assertEqual(record["establishments"], 321)
        route = route_discovery_record(record)
        self.assertEqual(route["reviewStatus"], "INTELLIGENCE_ONLY")

    def test_query_uses_supported_geography_and_naics_fields(self):
        params = build_census_cbp_params(
            state_fips="26", county_fips="*", naics_code="333", api_key="runtime-test-key"
        )
        self.assertEqual(params["for"], "county:*")
        self.assertEqual(params["in"], "state:26")
        self.assertEqual(params["NAICS2017"], "333")

    def test_environment_key_is_consumed_but_not_returned(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["census"]
        observed = {}

        def transport(_endpoint, params):
            observed.update(params)
            return fixture

        with patch.dict("os.environ", {"CENSUS_API_KEY": "runtime-census-secret"}, clear=False):
            result = fetch_census_cbp(
                vintage=2023, state_fips="26", county_fips="161", naics_code="333",
                transport=transport, retrieved_at="2026-10-15T00:00:00Z",
            )
        self.assertEqual(observed["key"], "runtime-census-secret")
        self.assertNotIn("runtime-census-secret", repr(result))
        self.assertEqual(result["writesPerformed"], 0)

    def test_repeated_ingestion_deduplicates(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["census"]
        record = normalize_census_cbp_rows(fixture, vintage=2023)[0]
        outcome = reconcile_batch([record, dict(record)])
        self.assertEqual([item["status"] for item in outcome["outcomes"]], ["NEW", "DUPLICATE_REPEAT"])

    def test_missing_environment_key_stops_before_transport(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(CensusApiError) as caught:
                fetch_census_cbp(vintage=2023, state_fips="26", naics_code="00")
        self.assertEqual(caught.exception.category, "BLOCKED_CREDENTIALS")


if __name__ == "__main__":
    unittest.main()
