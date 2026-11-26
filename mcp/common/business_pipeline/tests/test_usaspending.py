from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.usaspending import fetch_award_intelligence


class UsaSpendingTests(unittest.TestCase):
    def test_historical_award_is_not_active_opportunity_and_truncation_is_explicit(self):
        def transport(_url, payload):
            return {
                "results": [{"Award ID": f"SIM-{payload['page']}", "Recipient Name": "SIMULATION RECIPIENT"}],
                "page_metadata": {"hasNext": True},
            }

        result = fetch_award_intelligence("2026-10-01", "2026-10-14", limit=1, max_pages=2, transport=transport)
        self.assertEqual(result["pagesFetched"], 2)
        self.assertTrue(result["truncated"])
        self.assertTrue(all(item["intelligenceStatus"] == "HISTORICAL_AWARD_NOT_ACTIVE_OPPORTUNITY" for item in result["records"]))


if __name__ == "__main__":
    unittest.main()
