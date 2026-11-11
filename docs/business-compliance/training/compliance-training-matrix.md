# Business Compliance Training Matrix

Version: 1.0
Status: draft for owner assignment

## Training rule

Personnel complete role-appropriate training before performing unsupervised work. Refresher cadence below is an internal baseline, not a claim that one cadence satisfies every contract or regulation. Contract-, license-, agency-, and incident-driven training requirements override it.

Completion evidence includes learner, role, module/version, source materials, instructor or delivery method, date, assessment/result, acknowledgement, next due date, and remediation. Training content must not include CUI, export-controlled technical data, credentials, or live restricted-party/customer data unless the learning environment is approved for it.

## Role matrix

| Module | Business owner | Contracting | Export | Import/logistics | Cyber/CUI | Finance | Records/admin | Engineering/product |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ethics, conflicts, reporting, anti-trafficking | Required | Required | Required | Required | Required | Required | Required | Required |
| SAM, UEI, entity status, reps/certs, exclusions | Awareness | Required | Awareness | Awareness | Awareness | Awareness | Support | Awareness |
| Solicitation, amendment, clause, flowdown, change control | Approval | Required | Required when trade-triggered | Required when trade-triggered | Required when cyber-triggered | Required | Support | Awareness |
| FCI/CUI, safeguarding, incident reporting, NIST/CMMC | Approval | Required | Required | Required | Required/owner | Awareness | Required | Required |
| Export jurisdiction, ECCN/EAR99, USML, deemed exports | Awareness | Awareness | Required/owner | Required | Required for access | Awareness | Support | Required |
| Screening, sanctions, end-use/end-user, red flags | Approval | Required | Required/owner | Required | Awareness | Required | Support | Awareness |
| Import reasonable care, HTS, value, origin, PGA, broker control | Awareness | Required when applicable | Awareness | Required/owner | Awareness | Required | Support | Product-data support |
| AES/EEI, export documents, licenses and provisos | Awareness | Awareness | Required/owner | Required | Awareness | Awareness | Support | Product-data support |
| Incoterms, logistics, insurance, LC/documentary consistency | Approval | Required | Required | Required/owner | Awareness | Required | Support | Awareness |
| Records, audit evidence, retention, legal hold | Awareness | Required | Required | Required | Required | Required | Required/owner | Awareness |
| ShieldMate RBAC, organization scope, App Check, audit hygiene | Awareness | Required | Required | Required | Required/owner | Required | Required | Required |
| Contract-to-trade tabletop and stop-gate exercise | Required | Required | Required | Required | Required | Required | Required | Required when involved |

## Ecosystem and volunteer operations

| Audience / lane | Required topics | Permitted activity after training | Activity requiring designated authority |
| --- | --- | --- | --- |
| ShieldMate commercial operations | Entity authority, SAM/contract records, procurement origin, excluded ITAR scope, screening, IOR/broker boundary, pricing, shipment, invoicing, records | Prepare commercial records and evidence within assigned role | Bid/no-bid, representations, signature, classification/license decision, IOR approval, transaction release |
| 2Marines and NWWNA collaborators | Separate entity/award ownership, program eligibility, grant cost separation, partner agreement, conflicts, privacy, tracker evidence | Outreach, referrals, data collection, draft narratives, authorized delivery and documentation | Eligibility certification, award acceptance, procurement/subrecipient determination, cost approval, binding representation |
| American Legion Post 282 participants | Separately verified charter/exemption/authority, site and program permissions, conflicts, data access | Only activities documented by its verified leadership and applicable agreement | Any use of Post identity, exemption, facilities, funds, eligibility, or signature before verification |
| Ypsilanti Hub coordinators | Hub as a site/lane pending sponsor verification, visitor/data handling, facility authority, escalation | Coordinate approved meetings, training, intake, referrals, and evidence routing | Contracting, banking, employing, procurement, award ownership, trade approval, or signing absent verified sponsor delegation |
| Volunteers | Document handling, minimum necessary data, source capture, tracker updates, hold/escalation, privacy | Collect information, prepare drafts, link evidence, log approved factual updates | High-risk trade approval, government representation/signature, customs filing for clients, grant eligibility certification, sanctions-hit resolution, restricted-transaction release |
| Contract-to-trade staff | Entity-to-closeout stage map, supplier/origin evidence, screening, IOR intake, broker boundary, acceptance/invoice | Operate assigned manual stages and stop on exceptions | Advance past any manual gate without named authorized decision-maker |
| Tracker/evidence editors | Workbook/Page relationship, row identity, status mapping, source/version/time, conflict preservation, sensitive-data exclusions | Human-authorized status/evidence updates | Automation setup, credential changes, workbook sharing, formula/schema changes, or automated writes |

All audiences must practice applying `HOLD_COMPLIANCE_REVIEW` and escalating to the correct legal entity. Training or access does not delegate signature, eligibility, customs, export, sanctions, financial, or transaction-release authority.

## Cadence and triggers

| Event | Minimum action |
| --- | --- |
| Before role access | Complete required modules and supervised practical check. |
| Annual baseline | Refresh all required modules and attest to current SOP. |
| Quarterly | Review official-source register, regulatory alerts, open holds, and audit findings with control owners. |
| New agency/contract clause | Targeted training before proposal or performance. |
| New country, item, technology, party type, or trade lane | Targeted classification/screening/import/export briefing before approval. |
| Regulatory, license, or procedure change | Update controlled material, issue change notice, and train affected roles before use. |
| Incident, near miss, audit finding, or filing rejection | Corrective training after root-cause review; verify effectiveness. |
| Extended absence or role transfer | Access/competency review before resuming regulated work. |

## Practical assessment

Training is complete only when the learner can:

1. identify the authoritative solicitation/award and current amendment;
2. distinguish a representation, clause, flowdown, evidence item, and approval;
3. recognize trade triggers, red flags, and controlled-information boundaries;
4. create linked federal and trade records with a shared `correlationId`;
5. demonstrate that a clear screening result is not a license or shipment approval;
6. place a transaction on hold and escalate without bypassing authorization; and
7. preserve source/version, reviewer, rationale, and change history.

## Training content workflow

1. Control owner selects current official sources and removes sensitive case data.
2. Subject-matter reviewer approves learning objectives and applicability notes.
3. Draft content may use `training_to_sop` only as an aid; generated content is not authoritative.
4. Owner validates every legal/regulatory statement and approves the version.
5. `ai-training-coordinator` may track/synchronize approved modules when the workflow is authorized.
6. Completion evidence is written to the authoritative system and linked to the role/access review.
7. Superseded versions remain retained with effective dates.

## Current platform limits

- `training_to_sop` has an active local entrypoint for `sop.generate`, but generated SOPs remain drafts requiring human approval; repository wiring does not prove deployment.
- `ai-training-coordinator` has an active local entrypoint for `training.sync`, not regulatory interpretation; repository wiring does not prove deployment.
- Slack may notify or collect intake; it is not the completion or approval system of record.
- Claims-based RBAC controls platform access, but access alone does not establish regulatory qualification.
