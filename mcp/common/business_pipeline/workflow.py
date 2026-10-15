"""Deterministic dry-run workflow packet builders."""

from datetime import datetime, timezone
import hashlib
from typing import Any, Dict, Iterable, List, Mapping, Optional


APPROVAL_CATEGORIES = {
    "BID_PURSUIT",
    "BID_SUBMISSION",
    "PARTNER_ENGAGEMENT",
    "SCREENING_DISPOSITION",
    "IMPORTER_OF_RECORD_DESIGNATION",
    "BROKER_ENGAGEMENT",
    "CONTRACT_MODIFICATION",
    "EXTERNAL_EMAIL_SENDING",
}


def route_discovery_record(
    record: Mapping[str, Any],
    *,
    shieldmate_eligibility_verified: bool = False,
    eligible_nonprofit_applicants: Iterable[str] = (),
) -> Dict[str, Any]:
    """Recommend a legal route without selecting or authorizing an entity."""
    opportunity_type = str(record.get("opportunityType") or "UNCLASSIFIED")
    nonprofits = list(eligible_nonprofit_applicants)
    route: Dict[str, Any] = {
        "opportunityType": opportunity_type,
        "legalEntityRecommendation": "UNASSIGNED_PENDING_REVIEW",
        "legalEntityIsDecision": False,
        "possiblePartners": [],
        "reviewStatus": "PENDING_REVIEW",
        "screeningStatus": "NOT_SCREENED",
        "executionHold": False,
        "allowedNextStatus": "HUMAN_REVIEW",
    }
    if opportunity_type == "FEDERAL_SOLICITATION":
        route["legalEntityRecommendation"] = "ShieldMate LLC" if shieldmate_eligibility_verified else "SHIELDMATE_PENDING_ELIGIBILITY"
        route["allowedNextStatus"] = "VERIFY_SHIELDMATE_ELIGIBILITY"
    elif opportunity_type == "GRANT_OPPORTUNITY":
        route["possiblePartners"] = nonprofits
        route["allowedNextStatus"] = "VERIFY_APPLICANT_ELIGIBILITY_AND_PROGRAM_AUTHORITY"
    elif opportunity_type == "FEDERAL_SUBCONTRACTING_OPPORTUNITY":
        route["legalEntityRecommendation"] = "ShieldMate LLC"
        route["allowedNextStatus"] = "VERIFY_PRIME_SOURCE_SCOPE_AND_SUBCONTRACTOR_QUALIFICATION"
    elif opportunity_type == "COMMERCIAL_TRADE_LEAD":
        route["legalEntityRecommendation"] = "ShieldMate LLC"
        route["reviewStatus"] = "HOLD_COMPLIANCE_REVIEW"
        route["executionHold"] = True
        route["allowedNextStatus"] = "COMPLETE_SCREENING_ORIGIN_END_USE_AND_IOR_REVIEW"
    elif opportunity_type == "GRANT_PROJECT_PARTNER_OPPORTUNITY":
        route["possiblePartners"] = nonprofits
        route["allowedNextStatus"] = "VERIFY_AWARDEE_VENDOR_OR_SUBRECIPIENT_ROLE"
    elif opportunity_type == "HISTORICAL_AWARD_INTELLIGENCE":
        route["reviewStatus"] = "INTELLIGENCE_ONLY"
        route["allowedNextStatus"] = "LINK_TO_SEPARATE_CURRENT_OPPORTUNITY_IF_ANY"
    elif opportunity_type in {"DOMESTIC_MARKET_STATISTIC", "INTERNATIONAL_TRADE_FLOW_STATISTIC"}:
        route["reviewStatus"] = "INTELLIGENCE_ONLY"
        route["allowedNextStatus"] = "USE_AS_MARKET_CONTEXT_ONLY_OR_LINK_TO_A_SEPARATE_VERIFIED_LEAD"
    return route


def stable_id(prefix: str, *parts: Any) -> str:
    material = "|".join(str(part or "") for part in parts)
    return f"{prefix}-{hashlib.sha256(material.encode('utf-8')).hexdigest()[:16].upper()}"


def evaluate_opportunity_fit(
    opportunity: Mapping[str, Any],
    organization: Mapping[str, Any],
    *,
    partner_candidates: Iterable[str] = (),
    product: Optional[Mapping[str, Any]] = None,
) -> Dict[str, Any]:
    factors: List[str] = []
    concerns: List[str] = []
    opportunity_naics = str(opportunity.get("naics") or "")
    org_naics = {str(value) for value in organization.get("naics") or []}
    if opportunity_naics and opportunity_naics in org_naics:
        factors.append("NAICS alignment requires human scope confirmation")
    else:
        concerns.append("NAICS alignment unverified")
    if opportunity.get("responseDeadline", {}).get("valid"):
        factors.append("Response deadline parsed")
    else:
        concerns.append("Response deadline missing or malformed")
    if not organization.get("eligibilityVerified"):
        concerns.append("Entity eligibility not verified for this opportunity")
    if organization.get("capacityStatus") != "VERIFIED":
        concerns.append("Capacity remains pending review")
    if opportunity.get("setAside"):
        concerns.append("Set-aside eligibility requires entity-specific verification")
    product = product or {}
    origin_requirement = str((opportunity.get("original") or {}).get("countryOfOriginRequirement") or "").strip()
    product_origin = str(product.get("countryOfOrigin") or "").strip()
    origin_eligible = product.get("originEligible")
    if origin_requirement and product_origin and origin_eligible is False:
        trade_flag = f"ORIGIN_GATE_FAILED: {product_origin} does not meet {origin_requirement}"
        concerns.append("Country-of-origin requirement not met; stop before bidding")
        review_status = "HOLD_COMPLIANCE_REVIEW"
        next_action = "STOP_BEFORE_BID_AND_REVIEW_ALTERNATE_SOURCE_OR_LEGAL_BASIS"
    else:
        trade_flag = "REVIEW_REQUIRED" if organization.get("foreignSourcingPossible") else "NO_FOREIGN_SOURCE_IDENTIFIED"
        review_status = "PENDING_REVIEW"
        next_action = "VERIFY_ELIGIBILITY_CAPACITY_ORIGIN_AND_PARTNER_AUTHORITY"
    return {
        "opportunityId": opportunity.get("stableOpportunityId"),
        "leadEntityRecommendation": organization.get("legalName") if organization.get("eligibilityVerified") else "UNASSIGNED_PENDING_ELIGIBILITY",
        "leadEntityIsDecision": False,
        "partnerCandidates": list(partner_candidates),
        "partnerSelectionStatus": "PENDING_REVIEW",
        "fitRationale": factors,
        "eligibilityConcerns": concerns,
        "tradeFlag": trade_flag,
        "reviewOwner": "ShieldMate owner",
        "reviewStatus": review_status,
        "nextAction": next_action,
    }


def possible_fit_payload(opportunity: Mapping[str, Any], fit: Mapping[str, Any]) -> Dict[str, Any]:
    posted = opportunity.get("postedDate") or {}
    deadline = opportunity.get("responseDeadline") or {}
    original = opportunity.get("original") or {}
    return {
        "opportunity_id": opportunity.get("stableOpportunityId"),
        "source": opportunity.get("source"),
        "notice_award_id": opportunity.get("sourceNoticeId") or opportunity.get("awardId"),
        "title": opportunity.get("title") or opportunity.get("description"),
        "agency_buyer": opportunity.get("agency") or opportunity.get("awardingAgency"),
        "naics_psc": f"{opportunity.get('naics') or ''} / {opportunity.get('psc') or ''}".strip(" /"),
        "place_of_performance": original.get("placeOfPerformance") or "UNVERIFIED",
        "posted_verified_date": posted.get("normalized") or opportunity.get("lastModifiedDate"),
        "response_deadline": deadline.get("normalized"),
        "opportunity_url": opportunity.get("officialLink"),
        "lead_entity": fit.get("leadEntityRecommendation"),
        "partner_candidate": "; ".join(fit.get("partnerCandidates") or []),
        "fit_rationale": "; ".join(fit.get("fitRationale") or []),
        "eligibility_gate": "; ".join(fit.get("eligibilityConcerns") or []) or "PENDING_HUMAN_CONFIRMATION",
        "trade_flag": fit.get("tradeFlag"),
        "source_confidence": "SYNTHETIC_TEST" if original.get("_fixture") else "OFFICIAL_SOURCE_READ",
        "review_owner": fit.get("reviewOwner"),
        "review_status": fit.get("reviewStatus"),
        "next_action": fit.get("nextAction"),
        "last_checked": opportunity.get("retrievedAt"),
    }


def create_approval_packet(
    *,
    category: str,
    record_reference: str,
    legal_entity: str,
    requestor: str,
    evidence: List[str],
    risk_flags: List[str],
    ai_recommendation: str,
    deadline: Optional[str] = None,
    requires_specialist: bool = False,
) -> Dict[str, Any]:
    if category not in APPROVAL_CATEGORIES:
        raise ValueError(f"Unsupported approval category: {category}")
    now = datetime.now(timezone.utc).isoformat()
    return {
        "approvalId": stable_id("APR", category, record_reference, legal_entity),
        "recordReference": record_reference,
        "legalEntity": legal_entity,
        "category": category,
        "requestor": requestor,
        "evidence": evidence,
        "riskFlags": risk_flags,
        "aiRecommendation": ai_recommendation,
        "aiDecisionAuthority": False,
        "approvalOwner": "ShieldMate owner",
        "approvalStatus": "PENDING_REVIEW",
        "availableHumanDecisions": ["APPROVE", "REJECT", "HOLD", "ESCALATE"],
        "specialistReviewRequired": requires_specialist,
        "humanDecision": None,
        "decisionTimestamp": None,
        "auditReference": stable_id("AUD", category, record_reference, now),
        "deadline": deadline,
        "createdAt": now,
        "executionAuthorized": False,
    }


def approval_payload(packet: Mapping[str, Any], *, daily_tracker_link: str) -> Dict[str, Any]:
    return {
        "approval_id": packet.get("approvalId"),
        "source_record_link": packet.get("recordReference"),
        "organization": packet.get("legalEntity"),
        "approval_type": packet.get("category"),
        "summary": packet.get("aiRecommendation"),
        "risk_compliance_flags": "; ".join(packet.get("riskFlags") or []),
        "evidence_location": "; ".join(packet.get("evidence") or []),
        "prepared_by": packet.get("requestor"),
        "recommended_action": packet.get("aiRecommendation"),
        "approval_owner": packet.get("approvalOwner"),
        "approval_status": packet.get("approvalStatus"),
        "decision": packet.get("humanDecision"),
        "decision_timestamp": packet.get("decisionTimestamp"),
        "deadline": packet.get("deadline"),
        "next_action": "HUMAN_REVIEW_OR_ESCALATION",
        "draft_email_link": None,
        "external_send_status": "NOT_SENT",
        "daily_tracker_link": daily_tracker_link,
        "last_updated": packet.get("createdAt"),
    }


def create_email_draft(
    *,
    category: str,
    sender_mailbox: str,
    sender_legal_entity: str,
    represented_entity: str,
    recipient: str,
    subject: str,
    body: str,
    linked_record: str,
    sender_identity_verified: bool,
) -> Dict[str, Any]:
    identity_match = sender_legal_entity == represented_entity
    status = "DRAFT_READY_FOR_HUMAN_REVIEW" if sender_identity_verified and identity_match else "HOLD_SENDER_IDENTITY"
    return {
        "draftId": stable_id("EML", category, linked_record, recipient, subject),
        "mode": "DRAFT_ONLY_NOT_CREATED_IN_GMAIL",
        "category": category,
        "from": sender_mailbox,
        "senderLegalEntity": sender_legal_entity,
        "representedEntity": represented_entity,
        "to": recipient,
        "subject": subject,
        "body": body,
        "linkedRecord": linked_record,
        "status": status,
        "externalSendStatus": "NOT_SENT",
        "sendAuthorized": False,
        "nextAction": "VERIFY_LEGAL_SENDER_AND_CREATE_REVIEWABLE_DRAFT" if status.startswith("HOLD") else "HUMAN_REVIEW_BEFORE_OPTIONAL_DRAFT_CREATION",
    }


def build_daily_handoff(
    *,
    generated_at: str,
    new_bids: List[Mapping[str, Any]],
    historical_awards: List[Mapping[str, Any]],
    screening_cases: List[Mapping[str, Any]],
    approvals: List[Mapping[str, Any]],
    email_drafts: List[Mapping[str, Any]],
) -> Dict[str, Any]:
    return {
        "mode": "DATED_DRY_RUN_HANDOFF_NO_PAGE_OR_SHEET_WRITE",
        "generatedAt": generated_at,
        "newBids": new_bids,
        "amendedSolicitations": [],
        "relevantHistoricalAwards": historical_awards,
        "partnerOpportunities": [item for item in new_bids if item.get("partner_candidate")],
        "upcomingResponseDeadlines": [item.get("response_deadline") for item in new_bids if item.get("response_deadline")],
        "screeningHolds": [item for item in screening_cases if item.get("executionHold")],
        "pendingApprovals": [item for item in approvals if item.get("approvalStatus") == "PENDING_REVIEW"],
        "supplierMessages": [],
        "draftEmails": email_drafts,
        "deliveryCommitments": [],
        "overdueMilestones": [],
        "openComplianceIssues": ["SAM_API_KEY unavailable", "Google writes not authorized", "Protected ranges not verified"],
        "completedImplementationMilestones": ["Local pre-flight", "Schema mapping", "Dry-run packet generation"],
        "targetPage": "https://chatgpt.com/space/page_99ef1fd4143c819196f5bdf34865a1ee",
        "writePerformed": False,
    }

