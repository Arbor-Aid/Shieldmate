import json
from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.comtrade import (
    COMTRADE_AUTH_HEADER,
    PROVIDER_DAILY_CALL_CEILING,
    ComtradeApiError,
    ComtradeDailyBudget,
    build_comtrade_params,
    fetch_comtrade_statistics,
    normalize_comtrade_rows,
)
from business_pipeline.workflow import route_discovery_record


FIXTURE = Path(__file__).parent / "fixtures" / "market_statistics.synthetic.json"


class ComtradeTests(unittest.TestCase):
    def setUp(self):
        self.fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["comtrade"]

    def fetch_args(self):
        return {
            "period": 2023,
            "reporter_code": 842,
            "partner_code": 764,
            "flow_code": "X",
            "commodity_code": "TOTAL",
            "max_records": 1,
            "retrieved_at": "2026-10-15T00:00:00Z",
        }

    def test_normalization_is_aggregate_intelligence_not_company_lead(self):
        record = normalize_comtrade_rows(self.fixture, retrieved_at="2026-10-15T00:00:00Z")[0]
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
        observed = {}

        def transport(_endpoint, params, headers):
            observed["params"] = dict(params)
            observed["headers"] = dict(headers)
            return self.fixture

        environment = {
            "COMTRADE_API_KEY": "runtime-primary-secret",
            "COMTRADE_SECONDARY_API_KEY": "runtime-secondary-secret",
        }
        with patch.dict("os.environ", environment, clear=True):
            result = fetch_comtrade_statistics(
                **self.fetch_args(),
                transport=transport,
                request_budget=ComtradeDailyBudget(10),
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

    def test_daily_budget_enforced_and_cannot_exceed_provider_ceiling(self):
        budget = ComtradeDailyBudget(1)
        fetch_comtrade_statistics(
            **self.fetch_args(), api_key="synthetic-primary-key-for-test",
            transport=lambda *_args: self.fixture, request_budget=budget,
        )
        with self.assertRaises(ComtradeApiError) as caught:
            fetch_comtrade_statistics(
                **self.fetch_args(), api_key="synthetic-primary-key-for-test",
                transport=lambda *_args: self.fixture, request_budget=budget,
            )
        self.assertEqual(caught.exception.category, "BLOCKED_DAILY_BUDGET")
        with self.assertRaises(ValueError):
            ComtradeDailyBudget(PROVIDER_DAILY_CALL_CEILING + 1)

    def test_daily_budget_rolls_over_on_new_utc_day(self):
        clock = [datetime(2026, 10, 15, 23, 59, tzinfo=timezone.utc)]
        budget = ComtradeDailyBudget(1, utc_now=lambda: clock[0])
        budget.reserve()
        with self.assertRaises(ComtradeApiError):
            budget.reserve()
        clock[0] = datetime(2026, 10, 16, 0, 0, tzinfo=timezone.utc)
        budget.reserve()
        self.assertEqual(budget.snapshot()["used"], 1)

    def test_429_retry_uses_bounded_exponential_backoff_then_succeeds(self):
        attempts = []
        sleeps = []

        def transport(*_args):
            attempts.append(True)
            if len(attempts) == 1:
                raise ComtradeApiError(429, "RATE_LIMITED", "synthetic rate limit")
            return self.fixture

        result = fetch_comtrade_statistics(
            **self.fetch_args(), api_key="synthetic-primary-key-for-test",
            transport=transport, request_budget=ComtradeDailyBudget(10),
            sleep=sleeps.append,
        )
        self.assertEqual(result["requestAttempts"], 2)
        self.assertEqual(sleeps, [1.0])

    def test_429_honors_valid_retry_after_with_delay_cap(self):
        attempts = []
        sleeps = []

        def transport(*_args):
            attempts.append(True)
            if len(attempts) == 1:
                raise ComtradeApiError(
                    429, "RATE_LIMITED", "synthetic rate limit", retry_after_seconds=7.0,
                )
            return self.fixture

        fetch_comtrade_statistics(
            **self.fetch_args(), api_key="synthetic-primary-key-for-test",
            transport=transport, request_budget=ComtradeDailyBudget(10),
            max_retry_delay_seconds=5.0, sleep=sleeps.append,
        )
        self.assertEqual(sleeps, [5.0])

    def test_429_retry_exhaustion_fails_closed(self):
        attempts = []
        sleeps = []

        def transport(*_args):
            attempts.append(True)
            raise ComtradeApiError(429, "RATE_LIMITED", "synthetic rate limit")

        with self.assertRaises(ComtradeApiError) as caught:
            fetch_comtrade_statistics(
                **self.fetch_args(), api_key="synthetic-primary-key-for-test",
                transport=transport, request_budget=ComtradeDailyBudget(10),
                max_retries=2, sleep=sleeps.append,
            )
        self.assertEqual(caught.exception.category, "RATE_LIMITED")
        self.assertEqual(len(attempts), 3)
        self.assertEqual(sleeps, [1.0, 2.0])

    def test_transport_error_and_payload_redact_primary_secret(self):
        synthetic_key = "synthetic-primary-key-for-redaction-test"

        def failed_transport(*_args):
            raise ComtradeApiError(429, "RATE_LIMITED", f"subscription-key={synthetic_key}")

        with self.assertRaises(ComtradeApiError) as caught:
            fetch_comtrade_statistics(
                **self.fetch_args(), api_key=synthetic_key, transport=failed_transport,
                request_budget=ComtradeDailyBudget(10), max_retries=0,
            )
        self.assertNotIn(synthetic_key, repr(caught.exception))

        payload = json.loads(json.dumps(self.fixture))
        payload["data"][0]["providerDiagnostic"] = f"api_key={synthetic_key}"
        result = fetch_comtrade_statistics(
            **self.fetch_args(), api_key=synthetic_key,
            transport=lambda *_args: payload, request_budget=ComtradeDailyBudget(10),
        )
        self.assertNotIn(synthetic_key, repr(result))
        self.assertIn("[REDACTED]", repr(result))


if __name__ == "__main__":
    unittest.main()
