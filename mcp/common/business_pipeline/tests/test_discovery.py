from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.discovery import (
    normalize_external_lead,
    normalized_content_hash,
    reconcile_batch,
    reconcile_record,
    stable_source_identity,
)


class DiscoveryIdentityTests(unittest.TestCase):
    def test_identity_excludes_retrieval_time_and_content_hash_detects_change(self):
        first = normalize_external_lead(
            opportunity_type="COMMERCIAL_TRADE_LEAD", source_identifier="Example Source",
            stable_source_record_id="ABC-1", title="Original", official_link="fixture://ABC-1",
            retrieved_at="2026-10-14T10:00:00Z",
        )
        repeated = normalize_external_lead(
            opportunity_type="COMMERCIAL_TRADE_LEAD", source_identifier=" example   source ",
            stable_source_record_id="abc-1", title="Original", official_link="fixture://ABC-1",
            retrieved_at="2026-10-14T11:00:00Z",
        )
        changed = normalize_external_lead(
            opportunity_type="COMMERCIAL_TRADE_LEAD", source_identifier="Example Source",
            stable_source_record_id="ABC-1", title="Modified", official_link="fixture://ABC-1",
            retrieved_at="2026-10-14T12:00:00Z",
        )
        self.assertEqual(first["identityHash"], repeated["identityHash"])
        self.assertEqual(first["contentHash"], repeated["contentHash"])
        self.assertNotEqual(first["contentHash"], changed["contentHash"])

    def test_batch_deduplicates_and_flags_conflicting_content(self):
        first = normalize_external_lead(
            opportunity_type="FEDERAL_SUBCONTRACTING_OPPORTUNITY", source_identifier="SIM",
            stable_source_record_id="1", title="One", official_link="fixture://1",
        )
        same = dict(first)
        changed = dict(first)
        changed["contentHash"] = normalized_content_hash({"title": "Changed"})
        result = reconcile_batch([first, same, changed])
        self.assertEqual(result["uniqueIdentities"], 1)
        self.assertEqual([item["status"] for item in result["outcomes"]], ["NEW", "DUPLICATE_REPEAT", "CONFLICTING_SOURCE_CONTENT_REVIEW"])
        self.assertEqual(result["writesPerformed"], 0)

    def test_modified_source_preserves_human_review_fields(self):
        original = normalize_external_lead(
            opportunity_type="GRANT_OPPORTUNITY", source_identifier="SIM", stable_source_record_id="G1",
            title="Before", official_link="fixture://G1",
        )
        original.update({"reviewStatus": "OWNER_REVIEWED", "notes": "Keep this note"})
        modified = normalize_external_lead(
            opportunity_type="GRANT_OPPORTUNITY", source_identifier="SIM", stable_source_record_id="G1",
            title="After", official_link="fixture://G1",
        )
        result = reconcile_record(modified, original)
        self.assertEqual(result["status"], "MODIFIED_SOURCE_CONTENT")
        self.assertEqual(result["record"]["reviewStatus"], "OWNER_REVIEWED")
        self.assertEqual(result["record"]["notes"], "Keep this note")
        self.assertEqual(result["record"]["title"], "After")

    def test_identity_requires_both_source_components(self):
        with self.assertRaises(ValueError):
            stable_source_identity("", "1")


if __name__ == "__main__":
    unittest.main()
