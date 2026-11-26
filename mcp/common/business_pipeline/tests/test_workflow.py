from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.workflow import (
    build_local_audit_event,
    build_daily_handoff,
    create_approval_packet,
    create_draft_scope,
    create_email_draft,
    create_procurement_packet,
    create_supplier_record,
    evaluate_opportunity_fit,
    route_discovery_record,
)


class WorkflowTests(unittest.TestCase):
    def test_fit_is_recommendation_and_partner_is_pending(self):
        fit = evaluate_opportunity_fit(
            {"stableOpportunityId": "SAM:SIM-1", "naics": "423830", "responseDeadline": {"valid": True}},
            {"legalName": "ShieldMate LLC", "naics": ["423830"], "eligibilityVerified": True, "capacityStatus": "VERIFIED"},
            partner_candidates=["2Marines"],
        )
        self.assertFalse(fit["leadEntityIsDecision"])
        self.assertEqual(fit["partnerSelectionStatus"], "PENDING_REVIEW")

    def test_thailand_origin_failure_stops_before_bid(self):
        fit = evaluate_opportunity_fit(
            {"stableOpportunityId": "SAM:SIM-TH", "original": {"countryOfOriginRequirement": "U.S.-made qualifying product"}, "responseDeadline": {"valid": True}},
            {"legalName": "ShieldMate LLC", "eligibilityVerified": True, "capacityStatus": "VERIFIED", "foreignSourcingPossible": True},
            product={"countryOfOrigin": "Thailand", "originEligible": False},
        )
        self.assertEqual(fit["reviewStatus"], "HOLD_COMPLIANCE_REVIEW")
        self.assertIn("STOP_BEFORE_BID", fit["nextAction"])

    def test_approval_and_email_remain_human_controlled(self):
        packet = create_approval_packet(
            category="BID_PURSUIT", record_reference="SAM:SIM-1", legal_entity="ShieldMate LLC",
            requestor="Codex dry-run", evidence=["fixture://sam"], risk_flags=["SIMULATION"],
            ai_recommendation="Review fit", requires_specialist=False,
        )
        self.assertEqual(packet["approvalStatus"], "PENDING_REVIEW")
        self.assertFalse(packet["executionAuthorized"])
        draft = create_email_draft(
            category="Bid clarification", sender_mailbox="simulation-sender@example.invalid",
            sender_legal_entity="2Marines", represented_entity="ShieldMate LLC",
            recipient="simulation@example.invalid", subject="SIMULATION", body="SIMULATION", linked_record="SAM:SIM-1",
            sender_identity_verified=True,
        )
        self.assertEqual(draft["status"], "HOLD_SENDER_IDENTITY")
        self.assertFalse(draft["sendAuthorized"])

    def test_daily_handoff_never_writes(self):
        handoff = build_daily_handoff(generated_at="2026-10-14T20:00:00Z", new_bids=[], historical_awards=[], screening_cases=[], approvals=[], email_drafts=[])
        self.assertFalse(handoff["writePerformed"])

    def test_shared_legal_routing_keeps_humans_in_control(self):
        federal = route_discovery_record({"opportunityType": "FEDERAL_SOLICITATION"})
        grant = route_discovery_record({"opportunityType": "GRANT_OPPORTUNITY"}, eligible_nonprofit_applicants=["2Marines"])
        trade = route_discovery_record({"opportunityType": "COMMERCIAL_TRADE_LEAD"})
        self.assertFalse(federal["legalEntityIsDecision"])
        self.assertEqual(grant["legalEntityRecommendation"], "UNASSIGNED_PENDING_REVIEW")
        self.assertEqual(grant["possiblePartners"], ["2Marines"])
        self.assertEqual(trade["screeningStatus"], "NOT_SCREENED")
        self.assertTrue(trade["executionHold"])

    def test_procurement_packet_chain_is_review_only_and_auditable(self):
        opportunity = {"stableOpportunityId": "SAM:SIM-PROC-1"}
        qualification = {
            "reviewStatus": "PENDING_REVIEW",
            "eligibilityConcerns": ["Entity eligibility not verified"],
        }
        supplier = create_supplier_record(
            opportunity_reference="SAM:SIM-PROC-1",
            legal_name="Synthetic Industrial Supply LLC",
            entity_role="SUPPLIER",
            source_reference="fixture://supplier/SIM-001",
            screening_status="PENDING_REVIEW",
            capacity_status="VERIFIED",
            ownership_status="PENDING_REVIEW",
        )
        scope = create_draft_scope(
            opportunity_reference="SAM:SIM-PROC-1",
            supplier_record_id=supplier["supplierRecordId"],
            deliverables=[{"item": "Synthetic safety kit", "quantity": 10}],
            assumptions=["SIMULATION only"],
            exclusions=["No bid submission", "No purchase order"],
        )
        packet = create_procurement_packet(
            opportunity=opportunity,
            qualification=qualification,
            supplier_record=supplier,
            draft_scope=scope,
            simulated_integrations=["document.process", "tradeops:/shipment/docs/generate"],
        )
        event = build_local_audit_event(
            sequence=1,
            stage="PROCUREMENT_PACKET",
            record_reference=packet["procurementPacketId"],
            artifact=packet,
            generated_at="2026-10-26T16:00:00Z",
        )
        self.assertEqual(supplier["verificationStatus"], "HOLD_REVIEW")
        self.assertFalse(scope["binding"])
        self.assertEqual(packet["status"], "HOLD_REVIEW")
        self.assertFalse(packet["externalActionAuthorized"])
        self.assertFalse(packet["transactionAuthorized"])
        self.assertEqual(len(packet["contentHash"]), 64)
        self.assertTrue(event["appendOnly"])
        self.assertEqual(event["mode"], "LOCAL_SIMULATION_NO_EXTERNAL_WRITE")


if __name__ == "__main__":
    unittest.main()
