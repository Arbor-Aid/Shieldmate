from pathlib import Path
import sys
import unittest

COMMON = Path(__file__).resolve().parents[2]
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.workflow import (
    build_daily_handoff,
    create_approval_packet,
    create_email_draft,
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


if __name__ == "__main__":
    unittest.main()
