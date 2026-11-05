"""Generate an isolated procurement paperwork simulation with no external side effects."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys


REPO = Path(__file__).resolve().parents[1]
COMMON = REPO / "mcp" / "common"
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.sam import normalize_sam_opportunity  # noqa: E402
from business_pipeline.screening import create_screening_case  # noqa: E402
from business_pipeline.workflow import (  # noqa: E402
    build_daily_handoff,
    build_local_audit_event,
    create_approval_packet,
    create_draft_scope,
    create_procurement_packet,
    create_supplier_record,
    evaluate_opportunity_fit,
)


def read_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a sanitized procurement dry-run package"
    )
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    generated_at = datetime.now(timezone.utc).isoformat()
    opportunity_fixture = read_json(
        REPO / "mcp/common/business_pipeline/tests/fixtures/sam_opportunities.synthetic.json"
    )
    screening_fixture = read_json(
        REPO / "mcp/common/business_pipeline/tests/fixtures/screening_records.synthetic.json"
    )
    opportunity = normalize_sam_opportunity(
        opportunity_fixture["opportunitiesData"][0], retrieved_at=generated_at
    )
    opportunity_reference = opportunity["stableOpportunityId"]

    qualification = evaluate_opportunity_fit(
        opportunity,
        {
            "legalName": "ShieldMate LLC",
            "naics": ["423830"],
            "eligibilityVerified": False,
            "capacityStatus": "PENDING_REVIEW",
            "foreignSourcingPossible": True,
        },
        partner_candidates=["2Marines", "NWWNA"],
    )

    supplier_name = "Synthetic Industrial Supply LLC"
    screening_case = create_screening_case(
        linked_record=opportunity_reference,
        party_role="SUPPLIER",
        party={"name": supplier_name, "reference": "SIMULATED-SUPPLIER-001"},
        source_records=screening_fixture["records"],
        source_name="SYNTHETIC_FIXTURE_NOT_OFFICIAL_DATA",
        source_version=screening_fixture["sourceVersion"],
        retrieved_at=generated_at,
    )
    supplier_record = create_supplier_record(
        opportunity_reference=opportunity_reference,
        legal_name=supplier_name,
        entity_role="SUPPLIER",
        source_reference="fixture://screening/SIMULATED-SUPPLIER-001",
        screening_status="PENDING_REVIEW",
        capacity_status="PENDING_REVIEW",
        ownership_status="PENDING_REVIEW",
    )
    buyer_record = {
        "buyerRecordId": f"BUYER-{opportunity_reference}",
        "name": opportunity.get("agency") or "SIMULATED_BUYER_UNVERIFIED",
        "source": opportunity.get("source"),
        "verificationStatus": "PENDING_OFFICIAL_SOURCE_REVIEW",
        "authorityVerified": False,
    }
    draft_scope = create_draft_scope(
        opportunity_reference=opportunity_reference,
        supplier_record_id=supplier_record["supplierRecordId"],
        deliverables=[
            {
                "line": 1,
                "description": "Synthetic commercial safety-equipment kit",
                "quantity": 10,
                "unit": "kit",
                "acceptance": "Specification and inspection criteria pending human review",
            }
        ],
        assumptions=[
            "All names and quantities are sanitized simulation data",
            "Opportunity eligibility, supplier capacity, pricing, and origin remain unverified",
        ],
        exclusions=[
            "No bid submission",
            "No supplier contact",
            "No purchase order or invoice issuance",
            "No shipment, customs filing, financing, signature, or funds movement",
        ],
    )
    simulated_integrations = [
        "document-manager:document.process (operational-only; not invoked)",
        "ai-invoice-processor.status (Canon status skeleton; not an invoice workflow)",
        "tradeops:/shipment/docs/generate (parked/unmounted; simulated)",
        "tradefinance_lc:/lc/create-checklist (parked/unmounted; simulated)",
        "treasury:/risk/check (parked/unmounted; simulated)",
        "trade_execution_gateway:/trade/propose (parked/unmounted; not executed)",
    ]
    procurement_packet = create_procurement_packet(
        opportunity=opportunity,
        qualification=qualification,
        supplier_record=supplier_record,
        draft_scope=draft_scope,
        simulated_integrations=simulated_integrations,
    )
    approval = create_approval_packet(
        category="BID_PURSUIT",
        record_reference=procurement_packet["procurementPacketId"],
        legal_entity="ShieldMate LLC",
        requestor="FIELDBOT local procurement dry-run",
        evidence=[
            "mcp/common/business_pipeline/tests/fixtures/sam_opportunities.synthetic.json",
            "mcp/common/business_pipeline/tests/fixtures/screening_records.synthetic.json",
            procurement_packet["contentHash"],
        ],
        risk_flags=[
            "SIMULATION",
            "ENTITY_ELIGIBILITY_UNVERIFIED",
            "SUPPLIER_SCREENING_UNVERIFIED",
            "BUYER_AUTHORITY_UNVERIFIED",
            "TRADE_MCPS_PARKED",
        ],
        ai_recommendation="HOLD; human qualification, supplier, origin, pricing, and authority reviews are required",
        deadline=(opportunity.get("responseDeadline") or {}).get("normalized"),
        requires_specialist=True,
    )

    stages = [
        ("OPPORTUNITY_INTAKE", opportunity_reference, opportunity),
        ("QUALIFICATION", opportunity_reference, qualification),
        ("SUPPLIER_RECORD", supplier_record["supplierRecordId"], supplier_record),
        ("DRAFT_SCOPE", draft_scope["scopeId"], draft_scope),
        (
            "PROCUREMENT_PACKET",
            procurement_packet["procurementPacketId"],
            procurement_packet,
        ),
        ("APPROVAL_QUEUE", approval["approvalId"], approval),
    ]
    audit_trail = [
        build_local_audit_event(
            sequence=index,
            stage=stage,
            record_reference=reference,
            artifact=artifact,
            generated_at=generated_at,
        )
        for index, (stage, reference, artifact) in enumerate(stages, start=1)
    ]
    handoff = build_daily_handoff(
        generated_at=generated_at,
        new_bids=[],
        historical_awards=[],
        screening_cases=[screening_case],
        approvals=[approval],
        email_drafts=[],
    )
    handoff.update(
        {
            "procurementPackets": [procurement_packet],
            "supplierRecords": [supplier_record],
            "contractSupplierPipelineDependency": "THEBOT_INPUT_NOT_PRESENT_LOCAL_FIXTURE_USED",
        }
    )

    report = {
        "reportVersion": "1.0",
        "mode": "LOCAL_SANITIZED_SIMULATION_NO_EXTERNAL_MUTATION",
        "generatedAt": generated_at,
        "fixtureDisclosure": (
            "Every opportunity, party, item, quantity, and screening result is synthetic. "
            "No bid, contract, order, invoice, shipment, message, signature, or payment was created."
        ),
        "opportunity": opportunity,
        "qualification": qualification,
        "supplierRecord": supplier_record,
        "buyerRecord": buyer_record,
        "screeningCase": screening_case,
        "draftScope": draft_scope,
        "procurementPacket": procurement_packet,
        "approvalQueueRecord": approval,
        "auditTrail": audit_trail,
        "dailyTrackerHandoff": handoff,
        "externalMutations": [],
    }
    rendered = json.dumps(report, indent=2, sort_keys=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
