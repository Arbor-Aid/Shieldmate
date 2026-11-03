from copy import deepcopy
import json
from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
REPO_ROOT = Path(__file__).resolve().parents[4]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.comtrade import normalize_comtrade_rows
from business_pipeline.mcp_reuse import (
    MCP_REUSE_ROUTES,
    IncompatibleMcpContract,
    build_data_validation_request,
    verify_data_validation_response,
)
from business_pipeline.workflow import route_discovery_record


FIXTURE = Path(__file__).parent / "fixtures" / "market_statistics.synthetic.json"


class McpReuseTests(unittest.TestCase):
    def synthetic_record(self):
        fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))["comtrade"]
        record = normalize_comtrade_rows(fixture, retrieved_at="2026-10-15T00:00:00Z")[0]
        record["reviewStatus"] = route_discovery_record(record)["reviewStatus"]
        record["writesPerformed"] = 0
        return record

    def test_four_services_are_tier1_canon_on_disk_and_registered(self):
        service_index = json.loads((REPO_ROOT / "ops/mcp_service_index.json").read_text(encoding="utf-8"))
        fleet = json.loads((REPO_ROOT / "ops/mcp_fleet_contract.json").read_text(encoding="utf-8"))["services"]
        registry = (REPO_ROOT / "mcp/mcp-gateway/src/mcp/registry.ts").read_text(encoding="utf-8")
        readme = (REPO_ROOT / "README_MCPs.md").read_text(encoding="utf-8")
        index_by_slug = {item["slug"]: item for item in service_index}
        fleet_by_slug = {item["serviceId"]: item for item in fleet}

        for tool, contract in MCP_REUSE_ROUTES.items():
            service = contract["service"]
            self.assertTrue((REPO_ROOT / "mcp" / service / "main.py").is_file())
            self.assertEqual(index_by_slug[service]["activation_level"], "tier1_activated")
            self.assertTrue(index_by_slug[service]["live_behavior_present"])
            self.assertTrue(fleet_by_slug[service]["deployed"])
            self.assertEqual(fleet_by_slug[service]["status"], "canon")
            self.assertIn(f"route('{tool}', '{service}'", registry)
            self.assertIn(f"`{tool} -> {service}`", readme)
            main_source = (REPO_ROOT / "mcp" / service / "main.py").read_text(encoding="utf-8")
            self.assertIn(tool, main_source)

    def test_validation_adapter_preserves_all_controls_and_is_no_write(self):
        record = self.synthetic_record()
        prepared = build_data_validation_request(record)
        self.assertFalse(prepared["executionAuthorized"])
        self.assertFalse(prepared["writesAuthorized"])
        self.assertEqual(prepared["input"]["source_record"], record)

        response = {
            "ok": True,
            "service": "data-scrubbing-ai",
            "tool": "data.validate",
            "validation_result": {"normalized_data": deepcopy(prepared["input"])},
        }
        result = verify_data_validation_response(prepared, response)
        self.assertTrue(result["controlsPreserved"])
        self.assertFalse(result["executionAuthorized"])
        self.assertFalse(result["writesAuthorized"])

    def test_adapter_rejects_changed_hash_classification_review_or_write_state(self):
        prepared = build_data_validation_request(self.synthetic_record())
        for field, unsafe_value in (
            ("contentHash", "changed"),
            ("reviewStatus", "QUALIFIED"),
            ("humanReviewRequiredForBusinessUse", False),
            ("writesPerformed", 1),
        ):
            returned = deepcopy(prepared["input"])
            returned["source_record"][field] = unsafe_value
            response = {
                "ok": True,
                "service": "data-scrubbing-ai",
                "tool": "data.validate",
                "validation_result": {"normalized_data": returned},
            }
            with self.subTest(field=field):
                with self.assertRaises(IncompatibleMcpContract):
                    verify_data_validation_response(prepared, response)

    def test_incompatible_direct_record_routes_remain_blocked(self):
        self.assertTrue(MCP_REUSE_ROUTES["data.validate"]["directRecordRouting"])
        for tool in ("retrieval.search", "analytics.process", "reporting.aggregate"):
            self.assertFalse(MCP_REUSE_ROUTES[tool]["directRecordRouting"])


if __name__ == "__main__":
    unittest.main()
