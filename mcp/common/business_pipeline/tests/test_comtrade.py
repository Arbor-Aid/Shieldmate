import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.comtrade import (
    COMTRADE_AUTH_HEADER,
    ComtradeApiError,
    build_comtrade_params,
    fetch_comtrade_statistics,
    normalize_comtrade_rows,
)
from business_pipeline.workflow import route_discovery_record


FIXTURE = Path(__file__).parent / "fixtures" / "market_statistics.synthetic.json"


class ComtradeTests(unittest.TestCase):
    def test_normalization_is_aggregate_intelligence_not_company_lead(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["comtrade"]
        record = normalize_comtrade_rows(fixture, retrieved_at="2026-10-15T00:00:00Z")[0]
        self.assertEqual(record["recordType"], "AGGREGATE_TRADE_FLOW_STATISTIC")
        self.assertFalse(record["actionableOpportunity"])
        self.assertFalse(record["identifiedCompanyLead"])
        self.assertFalse(record["tariffClassificationDetermination"])
        self.assertEqual(record["classificationVersion"], "H6")
        self.assertEqual(route_discovery_record(record)["reviewStatus"], "INTELLIGENCE_ONLY")

    def test_bounded_request_parameters(self):
        params = build_comtrade_params(
            period=2023, reporter_code=842, partner_code=764,
            flow_code="X", commodity_code="TOTAL", max_records=1,
        )
        self.assertEqual(params["reporterCode"], 842)
        self.assertEqual(params["partnerCode"], 764)
        with self.assertRaises(ValueError):
            build_comtrade_params(
                period=2023, reporter_code=842, partner_code=764,
                flow_code="X", commodity_code="TOTAL", max_records=1001,
            )

    def test_primary_environment_key_is_header_only_and_secondary_unused(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["comtrade"]
        observed = {}

        def transport(_endpoint, params, headers):
            observed["params"] = dict(params)
            observed["headers"] = dict(headers)
            return fixture

        environment = {
            "COMTRADE_API_KEY": "runtime-primary-secret",
            "COMTRADE_SECONDARY_API_KEY": "runtime-secondary-secret",
        }
        with patch.dict("os.environ", environment, clear=False):
            result = fetch_comtrade_statistics(
                period=2023, reporter_code=842, partner_code=764, flow_code="X",
                commodity_code="TOTAL", max_records=1, transport=transport,
                retrieved_at="2026-10-15T00:00:00Z",
            )
        self.assertEqual(observed["headers"][COMTRADE_AUTH_HEADER], "runtime-primary-secret")
        self.assertNotIn("runtime-secondary-secret", repr(observed))
        self.assertNotIn("runtime-primary-secret", repr(result))
        self.assertFalse(result["secondaryKeyUsed"])
        self.assertEqual(result["writesPerformed"], 0)

    def test_missing_environment_key_stops_before_transport(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(ComtradeApiError) as caught:
                fetch_comtrade_statistics(
                    period=2023, reporter_code=842, partner_code=764,
                    flow_code="X", commodity_code="TOTAL",
                )
        self.assertEqual(caught.exception.category, "BLOCKED_CREDENTIALS")


if __name__ == "__main__":
    unittest.main()
