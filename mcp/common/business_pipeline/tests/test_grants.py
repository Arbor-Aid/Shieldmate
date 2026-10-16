from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.grants import (
    GrantsApiError,
    build_grants_search_request,
    fetch_grant_opportunity_detail,
    fetch_grants_pages,
    normalize_grant_opportunity,
)


class GrantsAdapterTests(unittest.TestCase):
    def test_request_and_normalization(self):
        request = build_grants_search_request(keyword="veterans", rows=1, start_record=0)
        self.assertEqual(request["rows"], 1)
        record = normalize_grant_opportunity({
            "id": "356629", "number": "SIM-NOFO", "title": "Simulation", "agency": "SIM",
            "openDate": "10/03/2024", "closeDate": "", "oppStatus": "forecasted", "cfdaList": ["00.000"],
        }, retrieved_at="2026-10-14T20:00:00Z")
        self.assertEqual(record["opportunityType"], "GRANT_OPPORTUNITY")
        self.assertEqual(record["postedDate"]["normalized"], "2024-10-03")
        self.assertIsNone(record["responseDeadline"]["normalized"])
        self.assertTrue(record["identityHash"])

    def test_pagination_dedup_and_response_token_not_retained(self):
        calls = []

        def transport(_endpoint, payload):
            calls.append(payload["startRecordNum"])
            record = {"id": "1", "number": "SIM-1", "title": "Simulation", "oppStatus": "posted"}
            return {"errorcode": 0, "token": "MUST_NOT_BE_RETAINED", "data": {"hitCount": 2, "startRecord": payload["startRecordNum"], "oppHits": [record]}}

        result = fetch_grants_pages(rows=1, max_pages=2, transport=transport, retrieved_at="2026-10-14T20:00:00Z")
        self.assertEqual(calls, [0, 1])
        self.assertEqual(result["uniqueRecords"], 1)
        self.assertFalse(result["responseTokenRetained"])
        self.assertNotIn("token", result)

    def test_malformed_response_fails_closed(self):
        with self.assertRaises(ValueError):
            fetch_grants_pages(transport=lambda *_: {"errorcode": 0, "data": {}}, max_pages=1)

    def test_detail_discards_token_and_backend_unavailability_fails_closed(self):
        detail = fetch_grant_opportunity_detail(
            "SIM-1",
            transport=lambda *_: {"errorcode": 0, "token": "DO_NOT_RETAIN", "data": {"synopsis": {"title": "Simulation"}}},
            retrieved_at="2026-10-14T20:00:00Z",
        )
        self.assertFalse(detail["responseTokenRetained"])
        self.assertNotIn("token", detail)
        with self.assertRaises(GrantsApiError) as caught:
            fetch_grant_opportunity_detail(
                "SIM-1",
                transport=lambda *_: {"errorcode": 0, "data": {"message": "Backend server is not available."}},
            )
        self.assertEqual(caught.exception.category, "UPSTREAM_BACKEND_UNAVAILABLE")


if __name__ == "__main__":
    unittest.main()
