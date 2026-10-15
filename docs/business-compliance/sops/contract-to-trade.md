# SOP: Federal Contract to Trade Execution

Version: 1.0
Effective status: draft for owner approval
Review cycle: quarterly and on regulatory, contract, entity, product, country, system, or personnel change

## Purpose

Create one controlled path from federal opportunity intake through award performance and any related import/export activity. The procedure is manual-first and fail-closed. It does not activate the transitional TradeOps MCP routes.

## Roles

| Role | Responsibility |
| --- | --- |
| Business owner | Approves bid/no-bid, commercial risk, and final operational go/no-go. |
| Contracting lead | Maintains SAM/entity readiness, solicitation/award baseline, clause matrix, deliverables, modifications, and closeout. |
| Export lead | Approves jurisdiction, classification, end-use/end-user/destination review, screening disposition, and export authorization. |
| Import lead | Approves importer-of-record plan, HTS, value, origin, admissibility, PGA, entry, broker instructions, and post-entry records. |
| Cybersecurity/CUI owner | Approves authorized systems and FCI/CUI/DFARS/CMMC handling before protected information enters a system. |
| Finance | Reviews price, funding, payment, banking, duty/tax, letter-of-credit, and reconciliation controls. |
| Records owner | Applies retention, access, legal hold, disposition, and reproducible evidence requirements. |
| Independent approver | Reviews high-risk or regulated release gates; must not approve solely from an AI summary. |

One person may hold multiple roles in a small organization, but the record must identify an independent approval for a regulated shipment/release and for unresolved high-risk issues.

### Ecosystem role boundaries

- ShieldMate LLC is the intended commercial operator. It contracts, buys, sells, imports, exports, and invoices only in its own verified capacity and under its own approvals.
- 2Marines, NWWNA, and American Legion Post 282 remain distinct organizations. The applicant/awardee must be eligible for the specific program; a partner's EIN, exemption, SAM status, certifications, bank account, or award cannot be used by ShieldMate or another collaborator.
- A nonprofit award remains the awardee's. Any ShieldMate vendor or partner role requires documented eligibility, procurement/subrecipient analysis, agreement, conflict/related-party review, cost allocation, separate invoicing, and duplicate-reimbursement control.
- Ypsilanti Hub is a proposed physical/local delivery lane pending verification of its sponsor/operator, location, leadership, legal status, premises authority, insurance, and data/security responsibility. Route binding decisions to the verified sponsoring entity.
- Volunteers may collect facts, preserve sources, prepare drafts, and update authorized status/evidence fields. They may not certify eligibility, sign representations, approve controlled trade, resolve sanctions hits, act as IOR/broker, submit customs filings for clients, or release a held transaction.

## Procedure

### 1. Establish entity readiness

1. Identify the exact `Applicant_Entity`, `Contracting_Entity`, `Awardee_Entity`, `Operating_Entity`, and `Vendor_Entity` that will apply, bid, receive funds, perform, or supply. Use one legal entity for each binding responsibility.
2. Verify SAM registration, UEI, CAGE (if assigned), status, expiration, points of contact, and representations/certifications directly in SAM.gov.
3. Verify size and any socioeconomic status for the opportunity's NAICS code and date.
4. Record exclusions, licenses, `Hub_or_Delivery_Site`, partners, `Agreement_or_Authority_Reference`, `Cost_Allocation`, `Eligibility_Verification`, `Conflict_Review`, and `Authorized_Approver` evidence.
5. Create or update the federal opportunity record.

Gate: `ENTITY_READY`. Any mismatch, inactive registration, unsupported certification, or unresolved exclusion produces `HOLD`.

### 2. Capture the opportunity baseline

1. Save the solicitation/notice, every attachment and amendment, Q&A, and authoritative URL.
2. Record due dates with time zones, submission method, agency contacts, NAICS/PSC, set-aside, contract type, scope, place of performance, and evaluation factors.
3. Preserve file versions or hashes so later amendments are detectable.
4. Identify required registrations, licenses, clearances, insurance, bonding, key personnel, subcontractors, and representations.

Gate: `BASELINE_COMPLETE`. A missing amendment or attachment produces `HOLD`.

### 3. Perform bid/no-bid and clause review

1. Build the provision/clause/flowdown matrix from the actual solicitation, agency supplement, and incorporated references.
2. Assign each requirement an owner, evidence, due date, status, and flowdown decision.
3. Identify FCI/CUI, DFARS/CMMC, privacy, security, incident-reporting, records, audit, property, domestic-preference, country-of-origin, sourcing, and trade triggers.
4. Record exceptions and questions for the contracting officer; do not silently assume them away.
5. Obtain business-owner approval for `BID`, `NO_BID`, or `HOLD`.

Gate: `BID_APPROVED`. Unresolved mandatory requirements remain `HOLD`.

### 4. Prepare and submit the offer

1. Assemble the proposal from controlled source records.
2. Validate all certifications and representations against current facts.
3. Confirm price, schedule, exceptions, subcontractor representations, and delivery assumptions.
4. Perform an independent compliance check against the submission instructions.
5. Preserve the exact submitted package, receipt, timestamp, and authorized signatory.

Gate: `SUBMISSION_AUTHORIZED`.

### 5. Baseline the award

1. Compare the award with the offer and solicitation; identify changed clauses, scope, schedule, price, deliverables, and assumptions.
2. Update the clause/flowdown matrix and obtain owner acceptance of new obligations.
3. Establish modification control, invoice/reporting calendars, subcontract flowdowns, property controls, and closeout requirements.
4. Do not begin protected-data handling until the cybersecurity/CUI owner approves the environment.

Gate: `AWARD_BASELINED`.

### 6. Open a linked trade record when triggered

Open `templates/trade-transaction-record.md` before any import, export, reexport, in-country transfer, temporary movement, foreign-person release, technical-data access, or defense service.

Record parties, routing, items, technical facts, countries, end-use/end-user, contract/CLIN, Incoterm, and importer/exporter roles. Reconcile these facts with domestic-preference and country-of-origin commitments in the award.

Gate: `TRADE_INTAKE_COMPLETE`.

### 7. Determine jurisdiction and classification

1. Determine regulatory jurisdiction first.
2. Record ECCN/EAR99 or USML/CJ basis, plus Schedule B and HTS decisions as applicable.
3. Validate origin, value, markings, admissibility, and other-agency requirements for imports.
4. Obtain specialist/counsel review for ambiguous jurisdiction, defense articles/services, novel technology, encryption, sanctioned destinations, or material classification disagreement.

Gate: `CLASSIFICATION_APPROVED`. Supplier statements alone do not close the gate.

Apply the excluded-by-default scope status: `STANDARD_COMMERCIAL_REVIEW`, `EXPORT_CLASSIFICATION_REQUIRED`, `HOLD_COMPLIANCE_REVIEW`, `REJECTED_CONTROLLED_SCOPE`, or `APPROVED_COMMERCIAL_SCOPE`. Apparently ITAR-controlled activity, classified data, unauthorized export-controlled technical data, or other activity outside ShieldMate's approved commercial scope must stop before content is uploaded or disclosed. Record only non-controlled refusal metadata and escalate ambiguity to a qualified reviewer. AI output is never a binding classification or license decision.

### 8. Screen parties and transaction risk

1. Screen every material party using current official sources or an approved provider that preserves source/version evidence.
2. Review ownership/control, aliases, addresses, transshipment, country programs, end-use/end-user restrictions, exclusions, and red flags.
3. Investigate possible matches; preserve the analysis and independent disposition.
4. Re-screen immediately before release/shipment and when a party or route changes.

Gate: `SCREENING_CLEARED`. The existing `mcp/tradeops/app.py` denied-party route is a stub and cannot satisfy this gate.

Use only these dispositions: `NO_CANDIDATE_MATCH`, `POTENTIAL_MATCH`, `FALSE_POSITIVE_REVIEWED`, `CONFIRMED_RESTRICTION`, `INSUFFICIENT_INFORMATION`, or `LEGAL_REVIEW_REQUIRED`. Capture official source/version/time and hold every unresolved candidate. Evaluate aliases, identifiers, location, ownership/control, sanctions program, end use, destination, and restriction terms; rescreen before execution and on material change. A clean name screen does not clear the transaction.

### 9. Determine authorization and filings

1. Determine export license/NLR/exception/exemption status and record the legal basis and conditions.
2. Determine ITAR/DDTC, OFAC, CBP, Census/AES, PGA, and foreign-country requirements as applicable.
3. Assign USPPI, authorized agent, importer of record, broker, forwarder, and filing responsibilities.
4. Obtain and record licenses/permits before relying on them; track validity, quantity/value decrements, provisos, and reporting.
5. Complete EEI/AES and import entry evidence, or record the exact exemption/basis.

Gate: `AUTHORIZATION_COMPLETE`.

### 10. Assemble and approve the execution packet

1. Reconcile contract/PO, commercial invoice, packing list, transport document, classifications, origin, licenses, screenings, filings, instructions, and payment terms.
2. Check names, addresses, quantities, values, currencies, item identifiers, country data, and dates across every document.
3. Route discrepancies back to the responsible owner without overwriting earlier evidence.
4. Obtain independent human release approval.

Gate: `RELEASE_APPROVED`.

For imports, the packet must name the eligible `Importer_Of_Record`, eligibility basis, responsible-party approval, broker or documented no-broker route, broker-license verification, POA reference where used, bond responsibility, HTS/origin/PGA evidence, entry reference, duty/tax responsibility, commercial invoice, acceptance authority, delivery evidence, and retention owner. ShieldMate is IOR only for its own eligible and approved import. Software coordination does not create IOR status. Missing IOR or authorized broker arrangements require `HOLD_COMPLIANCE_REVIEW`.

### 11. Execute and monitor

1. Release only within the approved facts, route, quantity/value, validity period, end-use, end-user, and license conditions.
2. Record actual movement/release, filings, license decrements, delivery, acceptance, and exceptions.
3. Stop on diversion, changed party/route/end-use, documentation mismatch, sanctions/list change, license issue, or contract modification.

Gate: `EXECUTED` or `HOLD`.

### 12. Reconcile, retain, train, and close

1. Reconcile actuals to award, shipment, entry, payment, filing, and license records.
2. Assess corrections, disclosures, claims, rejected filings, damaged/lost goods, and corrective actions.
3. Apply the longest applicable retention period and any legal hold.
4. Feed approved lessons into the training/SOP review process without placing controlled content in training data.
5. Complete contract and trade closeout approvals.

Gate: `CLOSED`.

## Mandatory stop conditions

Stop and set `HOLD` or `BLOCKED` when:

- the legal entity, party, item, destination, end-use, end-user, route, value, origin, or classification is incomplete or changed;
- SAM status, representation, certification, license, approval, or screening evidence is expired or unverifiable;
- a restricted-party match or transaction red flag is unresolved;
- FCI/CUI/technical data would enter an unapproved system or reach an unauthorized person;
- a required clause/flowdown, export/import authorization, EEI/entry filing, or document is missing;
- the transaction exceeds approved license, contract, quantity, value, route, or use conditions; or
- the automated result conflicts with source evidence or an authorized reviewer.

Slack messages, MCP status responses, AI output, and draft documents never override a hold.

## Audit minimum

Every transition records `recordId`, `correlationId`, `orgId`, actor UID, actor role, action, prior/new status, timestamp, evidence references, approval identity, reason, and retention class. Audit records must exclude secrets and unnecessary PII and remain append-only.

## Google tracker operating rule

Use the connected workbook as the detailed grant/contract task master and its linked **Project tracker** Page as the daily summary/action surface. Map organization authority to **Organizations**, applicant eligibility to **Applicant Routes**, partner/cost separation to **Collaborative Projects**, commercial stages to **Contracts**, assignments/deadlines/dependencies to **Next Actions**, and dated completed compliance evidence to **Funding Update Log**.

The tracker stores status, ownership, dates, and links to controlled evidence; it must not receive credentials, bank data, private keys, EINs unless specifically authorized and protected, controlled technical data, CUI, sensitive POAs, or complete customs identifiers. No automated write is authorized. A human using the owner-authorized workbook session must preserve formulas, dropdowns, formatting, row identity, notes, and unrelated content.
