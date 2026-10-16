import json
from pathlib import Path
import unittest


REPO_ROOT = Path(__file__).resolve().parents[4]
PIPELINE_DOCS = REPO_ROOT / "docs" / "business-compliance" / "pipeline"
MAPPING = PIPELINE_DOCS / "michigan-thailand-naics-hs-candidates.json"


class PilotArtifactTests(unittest.TestCase):
    def test_candidate_mapping_is_many_to_many_and_review_gated(self):
        artifact = json.loads(MAPPING.read_text(encoding="utf-8"))
        self.assertEqual(artifact["scope"]["origin"], "Michigan statewide")
        self.assertEqual(artifact["scope"]["initialCounty"], "Washtenaw County")
        self.assertEqual(artifact["scope"]["partnerCountry"], "Thailand")
        self.assertEqual(artifact["scope"]["aggregateNaics"], "333")

        required = {
            "naicsCode", "naicsVersion", "hsCode", "hsVersion", "mappingSource",
            "evidenceReference", "evidenceUrl", "confidence", "ambiguityNote", "reviewStatus",
            "disclaimer",
        }
        hs_to_naics = {}
        naics_to_hs = {}
        for mapping in artifact["mappings"]:
            self.assertTrue(required.issubset(mapping))
            self.assertEqual(mapping["reviewStatus"], "REQUIRES_TRADE_CUSTOMS_SPECIALIST")
            self.assertIn("census.gov", mapping["evidenceUrl"])
            self.assertIn("not a customs classification", mapping["disclaimer"].lower())
            hs_to_naics.setdefault(mapping["hsCode"], set()).add(mapping["naicsCode"])
            naics_to_hs.setdefault(mapping["naicsCode"], set()).add(mapping["hsCode"])

        self.assertTrue(any(len(values) > 1 for values in hs_to_naics.values()))
        self.assertTrue(any(len(values) > 1 for values in naics_to_hs.values()))
        disclaimer = artifact["disclaimer"].lower()
        self.assertIn("not a customs classification", disclaimer)
        self.assertIn("not", disclaimer)
        self.assertIn("customs ruling", disclaimer)

    def test_research_documents_keep_intelligence_and_execution_boundaries(self):
        pilot = (PIPELINE_DOCS / "michigan-thailand-pilot.md").read_text(encoding="utf-8")
        freight = (PIPELINE_DOCS / "michigan-thailand-freight-corridor.md").read_text(encoding="utf-8")
        self.assertIn("INTELLIGENCE_ONLY", pilot)
        self.assertIn("not a customs classification", pilot)
        self.assertIn("no external write or execution is authorized", freight)
        self.assertIn("https://www.bts.gov/ntad", freight)
        self.assertIn("usace.army.mil", freight)
        self.assertIn("do not prove current sailing schedules", freight)


if __name__ == "__main__":
    unittest.main()
