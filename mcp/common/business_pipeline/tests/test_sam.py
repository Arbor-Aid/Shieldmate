import json
from datetime import date
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.sam import (
    SamApiError,
    SamWindow,
    chunk_sam_date_range,
    classify_http_status,
    fetch_sam_pages,
    fetch_sam_date_range,
    format_sam_query_date,
    normalize_sam_opportunity,
    parse_sam_response_date,
    redact_sam_diagnostic_text,
    validate_sam_date_window,
)


FIXTURE = Path(__file__).parent / "fixtures" / "sam_opportunities.synthetic.json"


class SamDateTests(unittest.TestCase):
    def test_request_date_format(self):
        self.assertEqual(format_sam_query_date("10/14/2026"), "10/14/2026")
        with self.assertRaises(ValueError):
            format_sam_query_date("2026-10-14")

    def test_one_day_and_year_boundary(self):
        validate_sam_date_window(date(2026, 10, 14), date(2026, 10, 14))
        windows = chunk_sam_date_range(date(2026, 12, 31), date(2027, 1, 2))
        self.assertEqual([(w.start, w.end) for w in windows], [(date(2026, 12, 31), date(2027, 1, 2))])

    def test_leap_year_and_long_historical_range(self):
        windows = chunk_sam_date_range(date(2024, 2, 29), date(2026, 3, 1))
        self.assertGreater(len(windows), 1)
        self.assertEqual(windows[0].end, date(2025, 2, 28))
        self.assertEqual(windows[1].start, windows[0].end)
        self.assertEqual(windows[-1].end, date(2026, 3, 1))
        for window in windows:
            validate_sam_date_window(window.start, window.end)

    def test_window_exceeding_year_rejected(self):
        with self.assertRaises(ValueError):
            validate_sam_date_window(date(2025, 1, 1), date(2026, 1, 2))

    def test_response_dates_preserve_ambiguity(self):
        no_zone = parse_sam_response_date("2026-10-14T12:00:00")
        self.assertTrue(no_zone.valid)
        self.assertEqual(no_zone.timezone, "unspecified")
        missing = parse_sam_response_date(None)
        self.assertFalse(missing.valid)
        malformed = parse_sam_response_date("October someday")
        self.assertFalse(malformed.valid)


class SamPaginationTests(unittest.TestCase):
    def test_duplicate_notice_ids_and_offset_pagination(self):
        calls = []

        def transport(_endpoint, params):
            calls.append(params["offset"])
            if params["offset"] == 0:
                return {"totalRecords": 3, "limit": 2, "offset": 0, "opportunitiesData": [
                    {"noticeId": "A", "postedDate": "2026-10-14", "responseDeadLine": None},
                    {"noticeId": "B", "postedDate": None, "responseDeadLine": "bad"},
                ]}
            return {"totalRecords": 3, "limit": 2, "offset": 2, "opportunitiesData": [
                {"noticeId": "A", "postedDate": "2026-10-14", "responseDeadLine": "2026-11-01"}
            ]}

        checkpoints = []
        result = fetch_sam_pages(
            api_key="runtime-test-key",
            window=SamWindow(date(2026, 10, 14), date(2026, 10, 14)),
            transport=transport,
            page_size=2,
            checkpoint=checkpoints.append,
            retrieved_at="2026-10-14T20:00:00Z",
        )
        self.assertEqual(calls, [0, 2])
        self.assertEqual(result["uniqueRecords"], 2)
        self.assertFalse(result["truncated"])
        self.assertEqual(checkpoints[-1]["nextOffset"], 4)
        by_id = {r["sourceNoticeId"]: r for r in result["records"]}
        self.assertIn("invalid_or_missing_posted_date", by_id["B"]["normalizationIssues"])
        self.assertIn("invalid_or_missing_response_deadline", by_id["B"]["normalizationIssues"])

    def test_resume_offset_and_date_filter_validation(self):
        offsets = []

        def transport(_endpoint, params):
            offsets.append(params["offset"])
            return {"totalRecords": 3, "limit": 2, "offset": params["offset"], "opportunitiesData": [{"noticeId": "C"}]}

        result = fetch_sam_pages(
            api_key="runtime-test-key", window=SamWindow(date(2026, 10, 14), date(2026, 10, 14)),
            transport=transport, page_size=2, start_offset=2,
        )
        self.assertEqual(offsets, [2])
        self.assertEqual(result["uniqueRecords"], 1)
        with self.assertRaises(ValueError):
            fetch_sam_pages(
                api_key="runtime-test-key", window=SamWindow(date(2026, 10, 14), date(2026, 10, 14)),
                transport=transport, filters={"rdlfrom": "2026-10-14"},
            )

    def test_multi_window_overlap_deduplicates_and_can_skip_completed(self):
        calls = []

        def transport(_endpoint, params):
            calls.append(params["postedFrom"])
            return {"totalRecords": 1, "limit": 1000, "offset": 0, "opportunitiesData": [{"noticeId": "OVERLAP", "postedDate": "2025-01-01"}]}

        result = fetch_sam_date_range(
            api_key="runtime-test-key", start=date(2024, 1, 1), end=date(2026, 1, 2),
            transport=transport, completed_window_starts={"2024-01-01"},
        )
        self.assertEqual(result["windows"][0]["status"], "SKIPPED_COMPLETED")
        self.assertEqual(result["uniqueRecords"], 1)
        self.assertGreaterEqual(len(calls), 1)

    def test_fixture_and_malformed_response(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
        records = [normalize_sam_opportunity(item, retrieved_at="2026-10-14T20:00:00Z") for item in fixture["opportunitiesData"]]
        self.assertEqual(records[0]["stableOpportunityId"], "SAM:SIM-SAM-001")
        self.assertIn("invalid_or_missing_response_deadline", records[1]["normalizationIssues"])
        with self.assertRaises(ValueError):
            fetch_sam_pages(
                api_key="runtime-test-key",
                window=SamWindow(date(2026, 10, 14), date(2026, 10, 14)),
                transport=lambda *_: {"opportunitiesData": "not-a-list"},
            )

    def test_statuses_quota_and_unavailable_credentials(self):
        expected = {
            400: ("BAD_REQUEST", False),
            401: ("CREDENTIALS_EXPIRED_OR_INVALID", False),
            403: ("CREDENTIALS_FORBIDDEN_OR_QUOTA", False),
            404: ("NO_DATA_OR_ENDPOINT", False),
            429: ("QUOTA_EXHAUSTED", True),
            500: ("SOURCE_SERVER_ERROR", True),
            503: ("SOURCE_SERVER_ERROR", True),
        }
        for status, classification in expected.items():
            self.assertEqual(classify_http_status(status), classification)
        with self.assertRaises(SamApiError) as caught:
            fetch_sam_pages(api_key="", window=SamWindow(date(2026, 10, 14), date(2026, 10, 14)))
        self.assertEqual(caught.exception.category, "BLOCKED_CREDENTIALS")

    def test_environment_key_is_consumed_without_returning_it(self):
        observed = {}

        def transport(_endpoint, params):
            observed.update(params)
            return {"totalRecords": 0, "limit": 1000, "offset": 0, "opportunitiesData": []}

        with patch.dict("os.environ", {"SAM_API_KEY": "runtime-sam-secret"}, clear=False):
            result = fetch_sam_pages(
                window=SamWindow(date(2026, 10, 14), date(2026, 10, 14)),
                transport=transport,
            )
        self.assertEqual(observed["api_key"], "runtime-sam-secret")
        self.assertNotIn("runtime-sam-secret", repr(result))

    def test_http_diagnostic_redacts_keys_urls_and_jwts(self):
        key = "secret-runtime-key"
        redacted = redact_sam_diagnostic_text(
            'api_key=secret-runtime-key bearer abc.def.ghi token=eyJabc.def.ghi', secrets=(key,)
        )
        self.assertNotIn(key, redacted)
        self.assertNotIn("eyJabc.def.ghi", redacted)


if __name__ == "__main__":
    unittest.main()
