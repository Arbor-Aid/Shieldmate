# Daily Tracker Mapping

Verified: 2026-10-14
Master: Google Sheet `1EaJHJ9bDZS_jRA4KRe6mTcI6DmkQJ-wpcSTYXIGb_us`
Daily surface: [Project tracker](https://chatgpt.com/space/page_99ef1fd4143c819196f5bdf34865a1ee)

## Source-of-truth rule

The Google workbook is the detailed grant/contract pipeline and task reference. The Page is a daily summary/action view. Federal and trade templates hold the underlying controlled compliance decisions and evidence references. A local export is a dated read-only snapshot, never a co-equal editable pipeline.

## Field and workflow mapping

| Workbook tab | Required content | Compliance source | Daily Page treatment |
| --- | --- | --- | --- |
| Organizations | Legal organization; leadership/authority evidence; working legal status; distinct proposed role; routes; readiness gaps | Entity authority section of federal/trade record and controlled entity evidence | Summarize only a concrete readiness task or decision; never merge entity identities |
| Grants Pipeline | Opportunity identifier; applicant route; stage; deadline; official source; material eligibility/status | Federal opportunity record | Show due/blocked items and next decision, linked to workbook row/source |
| Applicant Routes | Grant/opportunity ID; one proposed eligible applicant; partner route; eligibility gate | `Applicant_Entity`, `Eligibility_Verification`, agreement and conflict records | State the legal applicant and unresolved gate; never imply eligibility transfer |
| Collaborative Projects | Project; partner deliverables; ShieldMate role; funding pairing; separate-cost rule; next step | Partner agreement, `Cost_Allocation`, conflict/procurement/subrecipient review | Summarize accountable organizations and next evidence; keep award/funds with awardee |
| Contracts | Commercial opportunity/award stage; contracting entity; scope; search/source; bid gate; next action | Federal record and linked trade record | Show commercial stage, due action, hold reason, and named owner |
| Next Actions | Owner; action; deadline; dependency; status; next step; completion evidence | Approved stage decision and evidence reference | Primary daily action feed; retain original owner and stable row identity |
| Funding Update Log | Date; affected IDs; material change; official source; workbook action; unresolved coverage | Completed compliance evidence or authorized decision | Daily evidence digest; no claim beyond the cited source |
| Excluded or Blocked | Exclusion/hold reason; source; reviewer; reconsideration trigger | `NO_BID`, `HOLD_COMPLIANCE_REVIEW`, `REJECTED_CONTROLLED_SCOPE`, sanctions/eligibility disposition | Preserve the hold; do not auto-reopen or release |
| Source Registry | Source URL; affected IDs; retrieval/version/hash/coverage | Official-source manifest/evidence | Report stale/failed source as a task, not as a substituted result |
| Discovery Inbox | Untriaged candidate information | Intake evidence | Mark unverified; never treat as an opportunity or eligibility decision |
| Refresh Data / Flow Dashboard / Automation Setup | Refresh health, derived views, and setup status | Workbook formulas/configuration | Observe only; do not overwrite formulas or install automation in this pass |

## Status normalization

- An action may be summarized as `OPEN`, `IN_PROGRESS`, `WAITING`, `HOLD`, `COMPLETE`, or `CLOSED` only when the workbook's exact current value and evidence support it.
- Regulated states remain exact: `HOLD_COMPLIANCE_REVIEW`, `REJECTED_CONTROLLED_SCOPE`, `POTENTIAL_MATCH`, `LEGAL_REVIEW_REQUIRED`, and other template statuses must not be softened by a dashboard summary.
- Completion means the required evidence is linked and an authorized decision exists. Drafting, AI output, an MCP response, or a calendar date alone is not completion.
- If Page and workbook conflict, preserve both versions, stop any proposed write, and route the conflict to the named owner. The workbook row and underlying evidence determine the detailed record; neither surface overrides a signed agreement or official source.

## Daily review sequence

1. Read source metadata/version and the current bounded ranges; do not scan unrelated Drive files.
2. Identify deadlines, dependencies, holds, changed official sources, and missing evidence.
3. Verify the responsible legal entity and human owner for each proposed update.
4. Draft the Page summary with links and `as of` time; do not expose sensitive cell content.
5. A human reviews any eligibility, bid, award, sanctions, export, customs, financial, or release statement.
6. If a permitted human workbook update is made, preserve row identity and record the dated material change in **Funding Update Log**.

No automated write is authorized by this mapping.
