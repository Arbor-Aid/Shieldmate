"""Local-only checks for parked trade domain modules.

These tests call deterministic in-process handlers with authentication, audit,
Firestore, and Slack side effects replaced. They never mount or deploy a service.
"""

import importlib
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch


REPO = Path(__file__).resolve().parents[4]
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))

# The test environment also has the third-party `mcp` package installed. Pin
# this test to the repository namespace so imports cannot resolve externally.
repository_mcp = ModuleType("mcp")
repository_mcp.__path__ = [str(REPO / "mcp")]
sys.modules["mcp"] = repository_mcp


def install_dependency_stubs():
    firebase_admin = ModuleType("firebase_admin")
    firebase_admin.initialize_app = lambda: None
    firebase_auth = ModuleType("firebase_admin.auth")
    firebase_auth.verify_id_token = lambda token: {}
    firebase_credentials = ModuleType("firebase_admin.credentials")
    firebase_admin.auth = firebase_auth
    firebase_admin.credentials = firebase_credentials
    sys.modules.setdefault("firebase_admin", firebase_admin)
    sys.modules.setdefault("firebase_admin.auth", firebase_auth)
    sys.modules.setdefault("firebase_admin.credentials", firebase_credentials)

    firestore = ModuleType("google.cloud.firestore")
    firestore.Client = lambda: None
    google_cloud = ModuleType("google.cloud")
    google_cloud.firestore = firestore
    sys.modules.setdefault("google.cloud", google_cloud)
    sys.modules.setdefault("google.cloud.firestore", firestore)


install_dependency_stubs()

tradeops = importlib.import_module("mcp.tradeops.app")
tradefinance = importlib.import_module("mcp.tradefinance_lc.app")
trade_gateway = importlib.import_module("mcp.trade_execution_gateway.app")
treasury = importlib.import_module("mcp.treasury.app")


def fake_request(path):
    return SimpleNamespace(
        url=SimpleNamespace(path=path),
        client=SimpleNamespace(host="127.0.0.1"),
    )


def safe_module_patches(module):
    claims = {
        "uid": "local-test-user",
        "email": "local-test@example.invalid",
        "orgId": "test-org",
        "roles": ["org_admin"],
    }
    return (
        patch.object(module, "verify_firebase_token", return_value=claims),
        patch.object(module, "enforce_org_match", return_value=None),
        patch.object(module, "require_approver", return_value=None),
        patch.object(module, "_audit", return_value={"mode": "local-test"}),
        patch.object(module, "slack_notify", return_value={"ok": False, "reason": "disabled"}),
    )


class ParkedTradeLocalIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def test_shipping_document_triage_and_generation_are_local_only(self):
        patches = safe_module_patches(tradeops)
        with patches[0], patches[1], patches[3], patches[4]:
            triage = await tradeops.shipment_triage(
                {
                    "orgId": "test-org",
                    "shipmentId": "SIM-SHIP-001",
                    "documents": [
                        {"type": "commercial_invoice"},
                        {"type": "packing_list"},
                        {"type": "bill_of_lading"},
                    ],
                },
                fake_request("/shipment/triage"),
                authorization="Bearer local-test",
            )
            documents = await tradeops.shipment_docs_generate(
                {"orgId": "test-org", "shipmentId": "SIM-SHIP-001"},
                fake_request("/shipment/docs/generate"),
                authorization="Bearer local-test",
            )
        self.assertEqual(triage["status"], "ready")
        self.assertEqual(triage["missingDocs"], [])
        self.assertEqual(len(documents["templates"]), 2)
        self.assertTrue(all(item["storagePath"].startswith("orgs/test-org/") for item in documents["templates"]))

    async def test_trade_finance_discrepancy_is_not_cleared(self):
        patches = safe_module_patches(tradefinance)
        with patches[0], patches[1], patches[3], patches[4]:
            result = await tradefinance.lc_doc_validate(
                {
                    "orgId": "test-org",
                    "lcId": "SIM-LC-001",
                    "documents": [{"type": "commercial_invoice"}],
                },
                fake_request("/lc/doc-validate"),
                authorization="Bearer local-test",
            )
        self.assertEqual(result["status"], "discrepancies_found")
        self.assertEqual(result["discrepancies"][0]["issue"], "missing storagePath")

    async def test_treasury_handoff_requires_approval_without_moving_funds(self):
        patches = safe_module_patches(treasury)
        with patches[0], patches[1], patches[3], patches[4]:
            result = await treasury.risk_check(
                {
                    "orgId": "test-org",
                    "proposedOrder": {"orderId": "SIM-PO-001", "notional": 500},
                    "policyRules": {"approvalThreshold": 250},
                },
                fake_request("/risk/check"),
                authorization="Bearer local-test",
            )
        self.assertTrue(result["approvalRequired"])
        self.assertTrue(result["pass"])

    async def test_trade_proposal_stops_at_pending_approval(self):
        patches = safe_module_patches(trade_gateway)
        with patches[0], patches[1], patches[3], patches[4]:
            result = await trade_gateway.trade_propose(
                {
                    "orgId": "test-org",
                    "order": {"orderId": "SIM-ORDER-001", "notional": 500},
                    "policyRules": {"approvalThreshold": 250},
                },
                fake_request("/trade/propose"),
                authorization="Bearer local-test",
            )
        self.assertEqual(result["status"], "pending_approval")
        self.assertTrue(result["approvalRequired"])
        self.assertNotIn("executed", result["status"])


if __name__ == "__main__":
    unittest.main()
