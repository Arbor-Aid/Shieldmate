"""Generate a local ShieldMate business-pipeline review package without writes."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys


REPO = Path(__file__).resolve().parents[1]
COMMON = REPO / "mcp" / "common"
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.preflight import run_preflight  # noqa: E402
from business_pipeline.census import normalize_census_cbp_rows  # noqa: E402
from business_pipeline.comtrade import normalize_comtrade_rows  # noqa: E402
from business_pipeline.discovery import normalize_external_lead, reconcile_batch, reconcile_record  # noqa: E402
from business_pipeline.grants import normalize_grant_opportunity  # noqa: E402
from business_pipeline.sam import normalize_sam_opportunity  # noqa: E402
from business_pipeline.screening import create_screening_case, screening_case_payload  # noqa: E402
from business_pipeline.sheets import build_write_preview, validate_sheet_schema  # noqa: E402
from business_pipeline.usaspending import fetch_award_intelligence  # noqa: E402
from business_pipeline.workflow import (  # noqa: E402
    approval_payload,
    build_daily_handoff,
    create_approval_packet,
    create_email_draft,
    evaluate_opportunity_fit,
    possible_fit_payload,
    route_discovery_record,
)


def read_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def schema_for(title, config, observed_by_title):
    target = config["googleSheet"]["targetSheets"][title]
    result = validate_sheet_schema(
        observed=observed_by_title[title],
        expected_sheet_id=target["sheetId"],
        logical_to_header=target["logicalToHeader"],
    )
    if result.status != "PASS":
        raise RuntimeError(f"{title} schema is {result.status}")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a dry-run business-pipeline review package")
    parser.add_argument("--live-public", action="store_true", help="Read one bounded page from public USAspending")
    parser.add_argument("--output", type=Path, required=True, help="Local JSON output path")
    args = parser.parse_args()

    now = datetime.now(timezone.utc).isoformat()
    config = read_json(REPO / "platform_bootstrap/integrations/google_drive/configs/business_pipeline_config.template.json")
    observed = read_json(REPO / "platform_bootstrap/integrations/google_drive/normalized/business_pipeline_sheet_schema.verified.json")
    observed_by_title = {sheet["title"]: sheet for sheet in observed["sheets"]}
    schemas = {title: schema_for(title, config, observed_by_title) for title in config["googleSheet"]["targetSheets"]}

    fixture = read_json(REPO / "mcp/common/business_pipeline/tests/fixtures/sam_opportunities.synthetic.json")
    ecosystem_fixture = read_json(REPO / "mcp/common/business_pipeline/tests/fixtures/ecosystem_opportunities.synthetic.json")
    market_fixture = read_json(REPO / "mcp/common/business_pipeline/tests/fixtures/market_statistics.synthetic.json")
    opportunities = [normalize_sam_opportunity(record, retrieved_at=now) for record in fixture["opportunitiesData"]]
    grant = normalize_grant_opportunity(ecosystem_fixture["grant"], retrieved_at=now)
    commercial = ecosystem_fixture["commercialTrade"]
    trade_lead = normalize_external_lead(
        opportunity_type="COMMERCIAL_TRADE_LEAD",
        source_identifier=commercial["sourceIdentifier"],
        stable_source_record_id=commercial["stableSourceRecordId"],
        title=commercial["title"],
        official_link=commercial["officialLink"],
        agency_or_buyer=commercial["agencyOrBuyer"],
        parties=commercial["parties"],
        source_status="SYNTHETIC_FIXTURE",
        details=commercial["details"],
        retrieved_at=now,
    )
    subcontract = ecosystem_fixture["subcontracting"]
    subcontract_lead = normalize_external_lead(
        opportunity_type="FEDERAL_SUBCONTRACTING_OPPORTUNITY",
        source_identifier=subcontract["sourceIdentifier"],
        stable_source_record_id=subcontract["stableSourceRecordId"],
        title=subcontract["title"],
        official_link=subcontract["officialLink"],
        agency_or_buyer=subcontract["agencyOrBuyer"],
        parties=subcontract["parties"],
        source_status="SYNTHETIC_FIXTURE",
        details=subcontract["details"],
        retrieved_at=now,
    )
    census_statistics = normalize_census_cbp_rows(market_fixture["census"], vintage=2023, retrieved_at=now)
    comtrade_statistics = normalize_comtrade_rows(market_fixture["comtrade"], retrieved_at=now)
    shieldmate = {
        "legalName": "ShieldMate LLC",
        "naics": ["423830"],
        "eligibilityVerified": False,
        "capacityStatus": "PENDING_REVIEW",
        "foreignSourcingPossible": True,
    }
    first_fit = evaluate_opportunity_fit(opportunities[0], shieldmate, partner_candidates=["2Marines", "NWWNA"])
    first_payload = possible_fit_payload(opportunities[0], first_fit)

    opportunities[1]["original"]["countryOfOriginRequirement"] = "U.S.-made qualifying product"
    thailand_fit = evaluate_opportunity_fit(
        opportunities[1], shieldmate,
        product={"countryOfOrigin": "Thailand", "originEligible": False},
    )
    thailand_payload = possible_fit_payload(opportunities[1], thailand_fit)

    screening_fixture = read_json(REPO / "mcp/common/business_pipeline/tests/fixtures/screening_records.synthetic.json")
    screening_case = create_screening_case(
        linked_record=trade_lead["stableOpportunityId"],
        party_role="SUPPLIER",
        party={"name": "North Star Example Trading", "reference": "SIMULATED-PARTY-001"},
        source_records=screening_fixture["records"],
        source_name="SYNTHETIC_FIXTURE_NOT_OFFICIAL_DATA",
        source_version=screening_fixture["sourceVersion"],
        retrieved_at=now,
    )

    approval = create_approval_packet(
        category="BID_PURSUIT",
        record_reference=opportunities[0]["stableOpportunityId"],
        legal_entity="ShieldMate LLC",
        requestor="Codex local dry-run",
        evidence=["mcp/common/business_pipeline/tests/fixtures/sam_opportunities.synthetic.json"],
        risk_flags=["ENTITY_ELIGIBILITY_UNVERIFIED", "SCREENING_REVIEW_REQUIRED", "SIMULATION"],
        ai_recommendation="HOLD pending owner review, entity eligibility, and compliance evidence",
        deadline=opportunities[0]["responseDeadline"]["normalized"],
        requires_specialist=True,
    )
    tracker = "https://chatgpt.com/space/page_99ef1fd4143c819196f5bdf34865a1ee"
    email_draft = create_email_draft(
        category="Bid clarification",
        sender_mailbox="simulation-sender@example.invalid",
        sender_legal_entity="2Marines",
        represented_entity="ShieldMate LLC",
        recipient="simulation@example.invalid",
        subject="SIMULATION - clarification request",
        body="SIMULATION ONLY. This draft was not created in Gmail and was not sent.",
        linked_record=opportunities[0]["stableOpportunityId"],
        sender_identity_verified=True,
    )

    historical = []
    if args.live_public:
        historical = fetch_award_intelligence("2026-09-01", "2026-10-14", limit=1, max_pages=1)["records"]

    fit_previews = [
        build_write_preview(first_payload, schemas["Possible Fit"]),
        build_write_preview(thailand_payload, schemas["Possible Fit"]),
    ]
    screening_preview = build_write_preview(screening_case_payload(screening_case), schemas["Screening Review"])
    approval_preview = build_write_preview(approval_payload(approval, daily_tracker_link=tracker), schemas["Jarvis Approval Queue"])
    handoff = build_daily_handoff(
        generated_at=now,
        new_bids=[first_payload, thailand_payload],
        historical_awards=historical,
        screening_cases=[screening_case],
        approvals=[approval],
        email_drafts=[email_draft],
    )
    shared_records = [
        opportunities[0], grant, trade_lead, subcontract_lead,
        *census_statistics, *comtrade_statistics,
    ]
    first_ingestion = reconcile_batch([*shared_records, dict(opportunities[0])])
    reviewed_grant = dict(grant)
    reviewed_grant.update({"reviewStatus": "OWNER_REVIEWED", "notes": "Synthetic human note must survive refresh"})
    changed_grant_source = dict(ecosystem_fixture["grant"])
    changed_grant_source["title"] = "SIMULATION Community Transition Support - amended"
    changed_grant = normalize_grant_opportunity(changed_grant_source, retrieved_at=now)
    change_detection = reconcile_record(changed_grant, reviewed_grant)
    routed_records = [
        {
            "identityHash": record["identityHash"],
            "contentHash": record["contentHash"],
            "recordReference": record.get("stableOpportunityId") or record["stableSourceRecordId"],
            "source": record["source"],
            "opportunityType": record["opportunityType"],
            "route": route_discovery_record(
                record,
                shieldmate_eligibility_verified=False,
                eligible_nonprofit_applicants=["2Marines", "NWWNA"],
            ),
            "stageTrace": [
                "SOURCE_READ_OR_FIXTURE",
                "NORMALIZED",
                "IDENTITY_ASSIGNED",
                "CONTENT_HASHED",
                "CLASSIFIED",
                "LEGAL_AND_TRADE_ROUTE_RECOMMENDED",
                "PENDING_HUMAN_REVIEW",
            ],
        }
        for record in shared_records
    ]
    report = {
        "reportVersion": "1.0",
        "mode": "LOCAL_DRY_RUN_NO_EXTERNAL_MUTATION",
        "generatedAt": now,
        "preflight": run_preflight(REPO, live_public=False),
        "fixtureDisclosure": "Federal, grant, commercial trade, subcontracting, screening, Census, and UN Comtrade records are synthetic simulations. The Census and Comtrade fixtures reflect the shape of owner-verified read-only queries but do not reproduce live values. USAspending is live public historical intelligence only when --live-public is supplied.",
        "credentialContract": {
            "requiredEnvironmentVariables": ["SAM_API_KEY", "CENSUS_API_KEY", "COMTRADE_API_KEY"],
            "secondaryComtradeKeyUsed": False,
            "credentialValuesIncluded": False
        },
        "sharedDiscoveryPath": {
            "records": routed_records,
            "firstIngestion": first_ingestion,
            "modifiedSourceContent": change_detection,
        },
        "possibleFitWritePreviews": fit_previews,
        "screeningReviewWritePreview": screening_preview,
        "jarvisApprovalWritePreview": approval_preview,
        "approvalPacket": approval,
        "emailDraft": email_draft,
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
