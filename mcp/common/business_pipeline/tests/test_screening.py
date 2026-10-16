from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline import FUZZY_THRESHOLD
from business_pipeline.screening import (
    create_screening_case,
    generate_candidates,
    normalize_official_screening_record,
)


SYNTHETIC = [{
    "uid": "SIM-1",
    "source": "SYNTHETIC",
    "listName": "SIMULATION ONLY",
    "name": "Northstar Example Trading LLC",
    "aliases": ["North Star Example Trading"],
    "identifiers": ["SIM-ID-77"],
    "programs": ["SIMULATED_RESTRICTION"],
    "sourceScore": 91,
    "sourceScoreScale": "SYNTHETIC_NOT_COMPARABLE",
}]


class ScreeningTests(unittest.TestCase):
    def test_threshold_and_exact_alias_candidates(self):
        exact = generate_candidates({"name": "Northstar Example Trading LLC"}, SYNTHETIC)
        self.assertEqual(exact[0]["matchType"], "EXACT_NAME")
        alias = generate_candidates({"name": "North Star Example Trading"}, SYNTHETIC)
        self.assertEqual(alias[0]["matchType"], "EXACT_ALIAS")
        fuzzy = generate_candidates({"name": "Northstar Example Trading"}, SYNTHETIC, threshold=FUZZY_THRESHOLD)
        self.assertGreaterEqual(fuzzy[0]["internalNameSimilarity"], FUZZY_THRESHOLD)

    def test_identifier_overrides_low_name_score_and_holds(self):
        candidates = generate_candidates({"name": "Unrelated Name", "identifiers": ["SIM-ID-77"]}, SYNTHETIC)
        self.assertEqual(candidates[0]["matchType"], "STRONG_IDENTIFIER")
        case = create_screening_case(
            linked_record="SIM-OPP-1",
            party_role="SUPPLIER",
            party={"name": "Unrelated Name", "identifiers": ["SIM-ID-77"], "reference": "PARTY-SIM-1"},
            source_records=SYNTHETIC,
            source_name="SYNTHETIC_FIXTURE",
            source_version="SIM-V1",
        )
        self.assertEqual(case["reviewStatus"], "POTENTIAL_MATCH")
        self.assertTrue(case["executionHold"])
        self.assertFalse(case["legalClearance"])

    def test_no_candidate_is_not_legal_clearance(self):
        case = create_screening_case(
            linked_record="SIM-OPP-2",
            party_role="END_USER",
            party={"name": "Completely Different Fictional Party", "reference": "PARTY-SIM-2"},
            source_records=SYNTHETIC,
            source_name="SYNTHETIC_FIXTURE",
            source_version="SIM-V1",
        )
        self.assertEqual(case["reviewStatus"], "NO_CANDIDATE_MATCH")
        self.assertFalse(case["legalClearance"])

    def test_official_source_scores_remain_source_specific(self):
        csl = normalize_official_screening_record({"id": "1", "name": "Example"}, source="ITA_CSL", source_version="2026-10-14")
        ofac = normalize_official_screening_record({"id": "2", "name": "Example"}, source="OFAC_SLS", source_version="2026-10-14")
        self.assertNotEqual(csl["sourceScoreScale"], ofac["sourceScoreScale"])


if __name__ == "__main__":
    unittest.main()
