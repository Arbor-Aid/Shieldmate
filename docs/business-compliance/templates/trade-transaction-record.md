# Trade Transaction Record

Create one record for each proposed import, export, reexport, in-country transfer, temporary import/export, release of controlled technology/technical data, or regulated defense service. Missing or conflicting evidence means `HOLD`.

## 1. Record control

| Field | Value |
| --- | --- |
| Trade record ID | `TRD-YYYY-NNNN` |
| Shipment / transfer ID | |
| Correlation ID | |
| Linked federal opportunity/award ID | |
| Legal entity / organization ID | |
| Transaction type | `IMPORT / EXPORT / REEXPORT / TRANSFER / TEMPORARY / TECHNOLOGY_RELEASE / SERVICE` |
| Status | `INTAKE / REVIEW / HOLD / CLEARED / FILED / SHIPPED / CLOSED / CANCELLED` |
| Export lead | |
| Import lead | |
| Independent approver | |
| Created / last reviewed | |

## 2. Parties and routing

Record full legal names and addresses; attach ownership/control and intermediary evidence where relevant.

| Role | Party | Country | Screening record/result | Notes |
| --- | --- | --- | --- | --- |
| Seller / supplier | | | | |
| Buyer / customer | | | | |
| USPPI / exporter | | | | |
| FPPI | | | | |
| Ultimate consignee | | | | |
| End-user | | | | |
| Importer of record | | | | |
| Intermediate consignee / freight forwarder | | | | |
| Customs broker | | | | |
| Bank / insurer / other party | | | | |

Route, transshipment countries, ports, and final destination:

### Legal-entity and collaboration routing

| Field | Value / evidence |
| --- | --- |
| `Applicant_Entity` | |
| `Contracting_Entity` | |
| `Awardee_Entity` | |
| `Operating_Entity` | |
| `Vendor_Entity` | |
| `Hub_or_Delivery_Site` | |
| `Partner_Organization` | List each partner and role separately. |
| `Agreement_or_Authority_Reference` | |
| `Cost_Allocation` | |
| `Eligibility_Verification` | |
| `Conflict_Review` | |
| `Authorized_Approver` | |

The entity using software, receiving goods, paying an invoice, or hosting activity is not automatically the contracting entity, exporter, USPPI, IOR, awardee, or owner. Designate each role independently and preserve its authority evidence.

## 3. Item and technical facts

| Field | Value |
| --- | --- |
| Item / software / technology / service description | |
| Part/SKU/model/version | |
| Quantity / unit / value / currency | |
| Technical specification evidence | |
| Country of origin and basis | |
| Contract/PO/CLIN linkage | |
| Intended end-use | |
| Intended end-user and site | |
| Foreign-person access or deemed-export facts | |

### Required controlled-scope intake

| Declaration | Value / evidence |
| --- | --- |
| Product name and technical characteristics | |
| Item jurisdiction/classification status where needed | |
| Manufacturing country | |
| Export destination and intermediate destinations | |
| End user and intended end use | |
| Defense article, defense service, or technical-data indicators | |
| Restricted-party and sanctions screening status | |
| Could any software user upload controlled technical data? | `YES / NO / UNKNOWN` plus data-boundary evidence |

## 4. Jurisdiction and classification

| Decision | Result | Basis / source / version | Reviewer/date | Expiration/change trigger |
| --- | --- | --- | --- | --- |
| U.S. regulatory jurisdiction | | | | |
| ECCN or EAR99 | | | | |
| USML category / Commodity Jurisdiction, if relevant | | | | |
| Schedule B / export code | | | | |
| HTSUS import classification | | | | |
| Country of origin / marking | | | | |
| Valuation method | | | | |
| PGA licenses/permits/admissibility | | | | |

Commercial-scope status: `STANDARD_COMMERCIAL_REVIEW / EXPORT_CLASSIFICATION_REQUIRED / HOLD_COMPLIANCE_REVIEW / REJECTED_CONTROLLED_SCOPE / APPROVED_COMMERCIAL_SCOPE`

Apparently ITAR-controlled activity, classified data, unauthorized export-controlled technical data, prohibited parties/destinations, or ambiguous controlled scope must be refused or quarantined outside this repository, tracker, Slack, AI prompts, and unfinished TradeOps runtimes. Record only non-controlled hold/refusal metadata and escalate to a qualified reviewer. An AI model may not make the binding jurisdiction, classification, licensing, sanctions, or exception decision.

## 5. Screening evidence

Screen at onboarding/intake and immediately before the regulated release or shipment. A possible match must remain on hold until documented resolution.

| Screen | Search inputs | Source/version | Timestamp | Result | Analyst / disposition evidence |
| --- | --- | --- | --- | --- | --- |
| Trade.gov CSL | | | | | |
| OFAC lists and ownership/control | | | | | |
| BIS lists / restrictions | | | | | |
| DDTC debarred/ineligible parties | | | | | |
| SAM exclusions | | | | | |
| Country/program sanctions | | | | | |
| Contract/customer-specific list | | | | | |

Red flags and resolution:

Resolution state: `NO_CANDIDATE_MATCH / POTENTIAL_MATCH / FALSE_POSITIVE_REVIEWED / CONFIRMED_RESTRICTION / INSUFFICIENT_INFORMATION / LEGAL_REVIEW_REQUIRED`

Candidate-match source entry, aliases/identifiers, address/location, ownership/control, sanctions program, restriction terms, reviewer rationale, approval, and rescreen trigger:

A clean name result does not clear ownership, destination, end use, product controls, licensing, or the transaction as a whole. `POTENTIAL_MATCH`, `INSUFFICIENT_INFORMATION`, `CONFIRMED_RESTRICTION`, and `LEGAL_REVIEW_REQUIRED` remain on hold unless and until an authorized disposition permits the next independent gate.

## 6. Authorization decision

| Field | Value |
| --- | --- |
| EAR license determination / NLR basis | |
| License exception and conditions, if used | |
| BIS license number / validity / provisos | |
| ITAR license, agreement, exemption, or approval | |
| OFAC license / program authorization | |
| Import license/permit/approval | |
| Destination/end-use/end-user restrictions | |
| Reexport/retransfer restrictions | |
| Required markings / statements | |
| Counsel/specialist review | |

No authorization may be inferred from a `no screening match` result.

## 7. Commercial and logistics controls

| Field | Value |
| --- | --- |
| Purchase/sales order | |
| Incoterm, named place, and version | |
| Title and risk transfer | |
| Freight / insurance owner | |
| Duty/tax owner | |
| Carrier / forwarder / broker | |
| Packing / labeling / marking | |
| Dangerous goods / hazmat status | |
| Letter of credit / documentary terms | |
| Diversion-control statement | |

### Importer-of-record and broker responsibility

| Field | Value / evidence |
| --- | --- |
| `Importer_Of_Record` | One eligible legal entity; do not place a sensitive importer number here. |
| `IOR_Eligibility_Basis` | Owner, purchaser, or properly designated licensed broker basis and evidence. |
| `Responsible_Party_Approval` | |
| `Customs_Broker_Name_or_Not_Used` | |
| `Broker_License_Verification` | CBP permitted-broker evidence and verification date. |
| `Broker_POA_Reference` | Controlled record reference, scope, and effective dates; do not attach sensitive POA here. |
| `CBP_Bond_Responsibility` | Principal, type, status, and controlled evidence reference. |
| `HTS_Classification` | Current HTSUS, basis, reviewer/date. |
| Country of origin / marking basis | |
| Partner government agency requirements | |
| `Customs_Entry_Reference` | |
| `Duties_and_Taxes_Responsibility` | |
| `Commercial_Invoice` | Controlled evidence reference. |
| `Shipment_and_Delivery_Evidence` | |
| Shipment acceptance authority/result | |
| Import record-retention owner/trigger | |

ShieldMate may be IOR only for its own eligible, approved imports. For customer shipments, designate the customer or another eligible party. Software coordination never makes ShieldMate IOR. If no qualified IOR or necessary authorized broker/POA/bond arrangement is documented, set `HOLD_COMPLIANCE_REVIEW` and do not execute. ShieldMate does not perform customs business for others or submit through another party's identity.

## 8. Filing and document packet

- [ ] Commercial invoice
- [ ] Packing list
- [ ] Transport document
- [ ] Purchase order / contract / award reference
- [ ] Classification evidence
- [ ] Origin evidence / certificate when required
- [ ] Licenses, exceptions/exemptions, provisos, and permits
- [ ] Screening evidence and match dispositions
- [ ] EEI/AES record, exemption citation, and ITN when applicable
- [ ] Import entry/summary and duty/tax evidence
- [ ] PGA documents
- [ ] End-use/end-user certification
- [ ] Broker/forwarder instructions and power of attorney where applicable
- [ ] Receipt, delivery, and discrepancy evidence

## 9. Release gate

- [ ] Transaction facts are complete and internally consistent.
- [ ] Jurisdiction/classification decisions are current.
- [ ] Destination, end-user, end-use, and license review is approved.
- [ ] All material parties were re-screened and possible matches resolved.
- [ ] Contract, domestic-preference, and award conditions are satisfied.
- [ ] Filings and documents are complete.
- [ ] No unresolved red flag, license proviso, sanction, or hold exists.
- [ ] Authorized human approver reviewed the underlying evidence.
- [ ] Commercial-scope status is `APPROVED_COMMERCIAL_SCOPE`; no apparently ITAR-controlled, classified, unauthorized controlled-data, prohibited-party, or prohibited-destination condition exists.
- [ ] A qualified IOR and every required broker, POA, bond, classification, origin, PGA, invoice, and duty/tax responsibility is documented.

Decision: `CLEARED / HOLD / BLOCKED / CANCELLED`
Conditions:
Approver/date:

## 10. Post-transaction and retention

| Field | Value |
| --- | --- |
| Actual ship/release/import date | |
| Actual quantity/value/destination | |
| ITN / entry number / license decrement | |
| Delivery / acceptance evidence | |
| Variance or incident | |
| Corrective filing / disclosure review | |
| Record classes and retention triggers | |
| Longest applicable disposition date | |
| Legal hold | |
| Closeout reviewer/date | |
