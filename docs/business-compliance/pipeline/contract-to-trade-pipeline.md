# Contract-to-Trade Compliance Pipeline

Version: 1.0
Status: documentation-only; no runtime activation

## Objective

Connect federal opportunity and award controls to import/export execution without creating a second system of record or representing placeholder TradeOps routes as production controls.

Authority chain:

```text
Human decision
  -> ShieldMate authoritative record
  -> MCP Gateway (claims/App Check/RBAC)
  -> approved external system or manual action
  -> append-only audit evidence
  -> Slack notification only
```

## Core records

| Record | Purpose | Minimum identifier |
| --- | --- | --- |
| Entity compliance profile | SAM/UEI/CAGE, reps/certs, status, ownership, approved roles, renewal dates | `entityComplianceId` |
| Federal opportunity/award | Solicitation, amendments, clause matrix, approvals, award, modifications, performance, closeout | `federalRecordId` |
| Trade transaction | Parties, items, classification, screening, authorization, filings, documents, release, reconciliation | `tradeRecordId` |
| Approval | Gate decision with actor, claims context, scope, evidence, reason, timestamp, expiry | `approvalId` |
| Evidence object | Immutable reference to authoritative source/document, version/hash, classification, retention | `evidenceId` |
| Training record | Approved module/version and learner completion evidence | `trainingRecordId` |
| Audit event | Append-only state transition or control action | `auditEventId` |

All related records share an opaque `correlationId`. Do not embed UEIs, CAGE codes, names, email addresses, classification details, or other sensitive data in the identifier.

## State model

```text
INTAKE
  -> ENTITY_READY
  -> BASELINE_COMPLETE
  -> BID_APPROVED
  -> SUBMITTED
  -> AWARD_BASELINED
  -> TRADE_REVIEW (when triggered)
  -> CLASSIFICATION_APPROVED
  -> SCREENING_CLEARED
  -> AUTHORIZATION_COMPLETE
  -> RELEASE_APPROVED
  -> EXECUTED
  -> RECONCILED
  -> CLOSED
```

At any state, new facts, expired evidence, a modification, possible restricted-party match, license issue, data-boundary issue, or document discrepancy can move the record to `HOLD` or `BLOCKED`. Only an authorized reviewer may return it to the pipeline. Earlier evidence and status history remain immutable.

## Stage and MCP mapping

This is a proposed routing map using the existing 34-service working inventory. It does not resolve Canon 28 and does not authorize deployment or activation.

| Stage | Authoritative human/control | Existing MCP support | Current limitation |
| --- | --- | --- | --- |
| Intake and document capture | Contracting lead; source files | `document-manager` (`document.process`) | May orchestrate documents; cannot decide legal applicability. |
| Source retrieval | Contracting/export/import lead; official source/version | `information-retrieval-ai` (`retrieval.search`) | Retrieved summaries must be checked against primary authority and the exact award. |
| Normalize and validate fields | Record owner | `data-scrubbing-ai` (`data.validate`), `org-scrubber-mcp` (`org.scrub`) | Validation is structural, not regulatory clearance. |
| Work assignment and deadlines | Contracting lead | `project-manager-agent` (`project.update`) | Tasks do not satisfy clauses or approvals. |
| Clause/evidence QA | Contracting lead and subject-matter reviewer | `qa-ai-agent` (`qa.evaluate`) | QA output is advisory until approved. |
| Training/SOP draft | Control owner | `training_to_sop` (`sop.generate`), `ai-training-coordinator` (`training.sync`) | Generated SOPs are drafts; training sync is not competence approval. |
| Contract/trade domain review | Export/import leads | `tradeops.status`, `tradefinance_lc.status` | Active `main.py` runtimes are placeholders; domain routes in `app.py` are not mounted. |
| Trade action proposal | Business/export/import approvers | `trade_execution_gateway.status` | Active runtime is placeholder. `app.py` trade execution is not mounted and broker integration is TODO. |
| Reporting and feedback | Control owners | `reporting.aggregate`, `analytics.process` | Metrics cannot override source evidence or holds. |
| Compliance specialty placeholders | Qualified owner | `ai-tax-compliance-agent.status`, `treasury.status` | Status-only/placeholder behavior; not a regulatory decision engine. |

## Manual-first implementation sequence

### Phase 0 — current documentation baseline

- Use the templates and SOP in `docs/business-compliance/`.
- Store decisions in the existing approved repository/system-of-record location.
- Use no TradeOps domain automation for regulated clearance.
- Preserve current claims, rules, gateway, and MCP fleet.

### Phase 1 — controlled record design

Before code changes, approve schemas for the core records above, data classification, evidence storage, retention, and legal holds. Map every write/read to `orgId`, required roles, App Check, audit events, and deny-by-default rules. Security review is required before schema or rules work.

### Phase 2 — read-only assistance

Allow authorized users to retrieve, normalize, compare, and draft from approved sources. Outputs remain `DRAFT` and must display source/version and confidence/exception indicators. No automated `CLEARED` status.

### Phase 3 — approval workflow

Add explicit, claims-scoped approval objects and immutable state transitions only after threat modeling and emulator tests. `super_admin` is the sole global override; organization roles remain scoped through `orgRoles`/`orgId`. Slack remains notify/intake only.

### Phase 4 — external integrations

Integrate approved providers one at a time: official/source retrieval, restricted-party screening, document storage, AES/ACE/broker interfaces, license systems, or banking. Each connector requires ownership, credentials isolation, idempotency, reconciliation, audit, failure handling, and a manual fallback.

### Phase 5 — execution

Execution remains impossible until all upstream gates are current and an authorized human approves the exact transaction facts. Revalidate immediately before side effects. Never infer approval from MCP health, a Slack action, an AI recommendation, or absence of an error.

## Gate contract

Every gate decision must include:

```json
{
  "recordId": "opaque-id",
  "correlationId": "opaque-id",
  "orgId": "claims-scoped-org",
  "gate": "SCREENING_CLEARED",
  "decision": "CLEARED | HOLD | BLOCKED | EXPIRED",
  "factsVersion": "immutable-version",
  "evidenceIds": ["evidence-id"],
  "sourceVersions": ["source-and-date"],
  "reviewerUid": "firebase-uid",
  "approverUid": "firebase-uid",
  "reason": "concise decision basis",
  "conditions": ["condition"],
  "decidedAt": "RFC3339 timestamp",
  "expiresAt": "RFC3339 timestamp or null"
}
```

Do not copy this object into production until its schema, sensitive-data classification, Firestore location, rules, validation, retention, and audit behavior are approved.

## Required legal-entity-to-closeout stage map

Every row is manual-first. `Responsible entity` is a field to be completed with one verified legal entity, not a shared ecosystem label. `Operator -> decision-maker` distinguishes staff/volunteer preparation from binding approval.

| Stage | Responsible entity | Required records / evidence location | Operator -> authorized decision-maker and gate | Google tracker mapping | Allowed next / exception |
| --- | --- | --- | --- | --- | --- |
| Legal Entity | Applicant/contracting/awardee entity, each named separately | Entity authority, eligibility, registrations, conflict and agreement references in FED record/controlled entity file | Contracting staff may collect -> entity signatory verifies `ENTITY_READY` | Organizations; Applicant Routes; Next Actions | Opportunity; otherwise `HOLD_COMPLIANCE_REVIEW` |
| Opportunity | `Applicant_Entity` or `Contracting_Entity` | Notice, solicitation, amendments, deadlines, source URLs/hashes in FED record | Staff/volunteer may capture -> contracting lead approves `BASELINE_COMPLETE` | Grants Pipeline or Contracts; Next Actions | Eligibility; missing source/amendment -> HOLD |
| Eligibility | One applicant/bidder | Program rules, SAM/size/certification evidence, award route, partner roles, conflict/cost separation in FED record | Staff drafts -> authorized entity approver certifies eligibility/bid route | Applicant Routes; Organizations; Funding Update Log | Product; ineligible/unverified -> NO_BID/HOLD |
| Product | Contracting/vendor entity | Product/service facts, specifications, data boundary, solicitation fit in FED/TRD records | Product staff provides facts -> contracting and compliance leads accept scope | Contracts; Next Actions | Supplier; controlled/ambiguous scope -> classification/HOLD |
| Supplier | Purchasing/contracting entity | Supplier identity, authority, quote, quality/capacity, ownership, flowdowns in controlled supplier file/TRD | Staff collects -> procurement/contracting approver selects | Collaborative Projects or Contracts; Next Actions | Origin; conflict/unverified supplier -> HOLD |
| Origin | Contracting/importing entity | Manufacturing country, substantial-transformation/component evidence, customs and procurement-origin analyses in FED/TRD | Supplier/product staff supplies evidence -> contracting/import reviewer approves | Contracts; Next Actions; Funding Update Log | Trade Screening; unmet solicitation origin rule -> NO_BID/HOLD |
| Trade Screening | `Operating_Entity` for the transaction | Parties, ownership, end use, destinations, official-list versions/results/dispositions in TRD controlled evidence | Trained analyst screens -> export/compliance reviewer resolves | Contracts; Next Actions; Funding Update Log | IOR; candidate/insufficient facts -> `HOLD_COMPLIANCE_REVIEW` |
| IOR | Eligible importer for this shipment | IOR designation/basis, approval, importer/bond references in TRD controlled evidence | Import staff prepares -> import lead and entity approver accept responsibility | Contracts; Next Actions | Broker; no eligible IOR -> HOLD |
| Broker | IOR/customer as principal | Broker license check, POA reference, scope, bond/entry responsibilities in TRD controlled evidence | Staff verifies -> IOR authorized signer executes any POA | Contracts; Next Actions | Pricing; missing required broker/POA/bond -> HOLD |
| Pricing | Contracting/bidding entity | Supplier quote, freight, duty/tax, broker, insurance, FX, contingency, cost-allocation and price approval | Finance/contracting prepares -> business owner approves | Contracts; Next Actions | Bid; unsupported cost/duplicate funding -> HOLD |
| Bid | `Contracting_Entity` | Final proposal, representations, clause matrix, origin/trade assumptions, approvals in FED controlled submission file | Staff drafts -> authorized signatory submits | Contracts; Next Actions; Funding Update Log | Award or NO_BID; expired facts/changed amendment -> HOLD |
| Award | `Awardee_Entity` | Executed award, clauses, CLINs, funding, acceptance/invoice terms, modifications in FED record | Contracting lead baselines -> authorized awardee approver accepts | Contracts; Funding Update Log; Next Actions | Shipment planning; scope/term mismatch -> HOLD |
| Shipment | Exporter/importer/contracting entity as separately designated | Release packet, classification, authorization, rescreen, filings, invoice, packing/transport docs in TRD record | Logistics executes only after export/import approvals -> independent release approver | Contracts; Next Actions | Acceptance; diversion/change/list hit -> HOLD |
| Acceptance | Awardee/vendor and named customer/agency acceptance authority | Delivery, inspection, discrepancy, acceptance/rejection evidence in FED/TRD | Delivery staff records -> named acceptance authority decides | Contracts; Next Actions; Funding Update Log | Invoice; rejection/discrepancy -> corrective HOLD |
| Invoice | Entity entitled to payment | Accepted deliverable, invoice, award/PO, allocation, duty/tax/reconciliation support in controlled finance record | Finance prepares -> authorized financial/contract approver releases | Contracts; Next Actions | Closeout/payment follow-up; duplicate/unallowable cost -> HOLD |
| Closeout | `Awardee_Entity`/contracting entity and trade parties for their records | Final acceptance/payment, property, filings, licenses, modifications, access removal, retention/legal hold in FED/TRD | Records/contracting reconcile -> authorized owner approves `CLOSED` | Contracts; Funding Update Log; Next Actions | Closed; unresolved obligation -> remain open/HOLD |

The sequence is `Legal_Entity -> Opportunity -> Eligibility -> Product -> Supplier -> Origin -> Trade_Screening -> IOR -> Broker -> Pricing -> Bid -> Award -> Shipment -> Acceptance -> Invoice -> Closeout`. A stage may be `NOT_APPLICABLE` only with approver, evidence, and rationale; it may not be silently skipped.

## Existing-capability quarantine and refusal boundary

Use existing documents and controlled manual records for intake. Before any content is routed to `mcp/tradeops/`, `mcp/tradefinance_lc/`, `mcp/trade_execution_gateway/`, or their bootstrap packages, confirm that it is standard commercial data approved for that specific system. Suspected classified information, ITAR-controlled technical data, unauthorized export-controlled technology, credentials, CUI, sensitive POAs/importer identifiers, sanctions-match evidence, or prohibited-party data stays out of the repository, Google tracker, Slack, AI prompts, and placeholder runtimes.

The present TradeOps denied-party behavior is a stub, and the existing trade finance/execution components do not establish official-list screening, classification, license, broker, AES/ACE, or release authority. Their responses cannot move a gate to cleared. Record the non-sensitive reason code, set `HOLD_COMPLIANCE_REVIEW` or `REJECTED_CONTROLLED_SCOPE`, and route the source material through a separately approved secure review channel. No runtime change is made by this design.

## Simulations

These examples are **SIMULATION** only. They do not assert an actual opportunity, eligibility, award, product classification, origin outcome, or government approval.

### SIMULATION A - ShieldMate as federal commercial supplier

- `Applicant_Entity`, `Contracting_Entity`, `Awardee_Entity`, and `Operating_Entity`: ShieldMate LLC. `Vendor_Entity`: approved commercial supplier where applicable.
- Opportunity: a hypothetical federal commercial-supply solicitation is captured in **Contracts** with official source and amendments. ShieldMate's SAM/status, size, authority, and representations remain verification gates.
- Product/supplier/origin: staff captures specifications, supplier, manufacturing country, procurement-origin test, customs classification, pricing, and data boundary. Contracting and trade reviewers independently approve the applicable facts.
- Screening/IOR/broker: all parties are screened from current official sources. ShieldMate is IOR only if it purchases/imports the goods for itself, eligibility and approval are documented, and an independent licensed broker is engaged where warranted.
- Bid/award/shipment: the authorized ShieldMate signatory alone submits. No shipment occurs until award terms, rescreen, authorizations, IOR/broker packet, and independent release gate are complete.

### SIMULATION B - eligible nonprofit applicant; ShieldMate only as vendor

- `Applicant_Entity` and, if selected, `Awardee_Entity`: 2Marines solely for this hypothetical program and only after program-specific eligibility verification. `Vendor_Entity`: ShieldMate LLC. Ypsilanti Hub is only an approved delivery site under its verified sponsor.
- 2Marines owns the application, representations, award, bank/accounting records, program income, reporting, and approvals. ShieldMate receives no award ownership or derivative eligibility.
- Before any ShieldMate work, 2Marines documents procurement or subrecipient/vendor classification, price/cost reasonableness, related-party/conflict review and mitigation, agreement, deliverables, data access, invoicing, cost allocation, and duplicate-reimbursement controls.
- Volunteers may collect sources and draft records. Only the nonprofit's authorized official certifies eligibility or signs; only ShieldMate's authorized official binds ShieldMate. **Collaborative Projects** describes delivery, while separate legal/financial records remain authoritative.

### SIMULATION C - Thailand-sourced product stops before bid

- ShieldMate considers a fictional Thailand-manufactured commercial product for a federal supply solicitation.
- The solicitation's reviewed FAR Part 25 clause requires a domestic end product for this item and acquisition. The record contains no applicable exception, waiver, qualifying transformation, or other supported route for the Thailand-sourced product.
- At `Origin`, contracting review records the country-of-origin evidence and clause analysis. The pipeline sets `NO_BID`/`HOLD`; it does not advance to Trade Screening, Pricing approval, or Bid.
- Staff may evaluate a compliant alternative supplier/product or seek an authoritative contracting-officer clarification. It may not relabel origin, assume that customs origin satisfies procurement origin, or treat Thailand as categorically acceptable or prohibited outside the specific solicitation analysis. See [FAR Subpart 25.1](https://www.acquisition.gov/far/subpart-25.1) and [FAR Subpart 25.4](https://www.acquisition.gov/far/subpart-25.4).

## Security and claims invariants

- Verify Firebase ID tokens at the active MCP Gateway.
- Consume canonical `roles[]`, `orgRoles{}`, and `orgId`; retain `role`/`org` only as the documented compatibility bridge.
- Require matching organization scope for every record and action.
- Deny missing, stale, malformed, or mismatched claims.
- Keep App Check and deny-by-default Firestore behavior.
- Require token refresh after claim changes.
- Do not authorize from email address, Slack identity, UI role label, or Firestore profile alone.
- Keep audit records append-only and free of secrets and unnecessary PII.

## Activation blockers

The pipeline cannot be represented as automated or production-ready until all of the following are resolved and approved:

- legal entity/SAM and compliance-owner facts;
- authoritative record schemas and retention schedule;
- FCI/CUI/export-controlled data boundary;
- restricted-party screening provider and match-resolution procedure;
- trade jurisdiction/classification and license decision ownership;
- TradeOps, trade finance, treasury, and execution gateway runtime activation;
- broker/AES/ACE/other external integrations and reconciliation;
- approval segregation and emergency/incident procedures;
- tests for claims/org isolation, App Check, holds, expiry, idempotency, and audit immutability; and
- Canon 28 governance resolution, if any runtime fleet change is proposed.

Until then, use this pipeline as a documentation and review sequence only.
