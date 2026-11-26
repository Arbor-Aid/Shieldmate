from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.sheets import build_write_preview, validate_sheet_schema


class SheetSchemaTests(unittest.TestCase):
    def test_exact_mapping_and_preview(self):
        mapping = {"opportunity_id": "Opportunity ID", "lead_entity": "Lead Entity"}
        schema = validate_sheet_schema(
            observed={"title": "Possible Fit", "sheetId": 9101, "headers": list(mapping.values())},
            expected_sheet_id=9101,
            logical_to_header=mapping,
        )
        self.assertEqual(schema.status, "PASS")
        preview = build_write_preview({"opportunity_id": "SAM:1", "lead_entity": "ShieldMate LLC"}, schema)
        self.assertEqual(preview["mode"], "DRY_RUN_NO_WRITE")
        self.assertEqual(preview["positionalRow"], ["SAM:1", "ShieldMate LLC"])

    def test_missing_duplicate_and_ambiguous_headers_fail_closed(self):
        result = validate_sheet_schema(
            observed={"title": "Possible Fit", "sheetId": 9101, "headers": ["Opportunity ID", "Opportunity-ID", "Opportunity ID"]},
            expected_sheet_id=9101,
            logical_to_header={"opportunity_id": "Opportunity ID", "lead_entity": "Lead Entity"},
        )
        self.assertEqual(result.status, "BLOCKED_SCHEMA")
        self.assertIn("Lead Entity", result.missing_headers)
        self.assertIn("Opportunity ID", result.duplicate_headers)
        self.assertTrue(result.ambiguous_headers)
        with self.assertRaises(ValueError):
            build_write_preview({"opportunity_id": "SAM:1"}, result)


if __name__ == "__main__":
    unittest.main()
