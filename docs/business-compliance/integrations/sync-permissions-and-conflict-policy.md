# Sync Permissions and Conflict Policy

Version: 1.0
Status: design only; no sync deployment or Google write authorization

## Permission tiers

| Tier | Identity and scope | Allowed behavior | Prohibited behavior |
| --- | --- | --- | --- |
| Interactive connected read | User-authorized ChatGPT Google connector; current connected account | Metadata and bounded cell reads for the named workbook | Assuming credentials exist in the repo/runtime; sharing, scope changes, or automated writes |
| Runtime read-only, future | Dedicated owner-approved identity; file-specific Viewer; `spreadsheets.readonly` and optional `drive.metadata.readonly` | Expected-file verification, bounded reads, dated controlled exports, audit metadata | Domain-wide delegation, broad Drive search, password/token logging, workbook edits |
| Runtime write, future and separately authorized | Dedicated identity; file-specific Editor; minimum Sheets write scope after security/design approval | Version-checked updates to explicitly mapped ranges and an append-only update log | Formula/schema/format rewrites, sharing changes, trigger installation, unrestricted row replacement, transaction release |
| Human owner/editor | Existing Google authorization and workbook controls | Manual review and approved edits | Storing secrets/controlled data or bypassing entity/compliance approvals |

## Pre-write conditions for any future integration

All conditions must be met before the first automated write:

1. explicit owner authorization naming identity, workbook, tabs/ranges, fields, and allowed operations;
2. successful read verification and data-classification/security review;
3. stable row identity that is not inferred only from row number;
4. captured spreadsheet version/modified time and expected sheet/tab IDs;
5. a dry-run diff showing old value, proposed value, source evidence, and actor;
6. conflict detection and fail-closed behavior;
7. formula, dropdown/data-validation, conditional-format, note/comment, protected-range, hidden-row/column, and merged-cell preservation tests;
8. append-only audit of actor, time, range/row identity, prior/new values or hashes, source, outcome, and correlation ID without secrets;
9. backup/export and rollback procedure approved for the workbook's data classification;
10. human approval for any legal-entity, eligibility, award, sanctions, trade, customs, financial, or release state.

## Conflict policy

- Never replace an entire sheet to update a row.
- Read the target row and relevant metadata immediately before write. If the version, row identity, formula, validation, note, or user-entered value changed since the draft, abort with `CONFLICT_REVIEW_REQUIRED`.
- Treat blank, formula result, user-entered text, dropdown value, and intentional clearing as distinct states.
- Do not change formulas, dropdowns, conditional formatting, protected ranges, hidden content, filters, named ranges, comments/notes, or unrelated columns unless each object is separately authorized.
- Append new dated evidence to **Funding Update Log**; do not rewrite history to make a current summary appear continuous.
- Preserve manual notes. Put machine provenance in dedicated approved fields or the audit record, not by overwriting user content.
- If Page, workbook, local snapshot, and controlled evidence disagree, freeze the write. The named owner compares timestamps, sources, and legal authority and records the resolution.
- A successful API call does not authorize a bid, certify eligibility, clear a sanctions result, classify an item, select an IOR, submit a customs filing, release a transaction, move funds, or close an award.

## Secrets and logging

Use workload identity or Secret Manager. Never commit or print passwords, refresh/access tokens, OAuth client secrets, service-account keys, session cookies, bank data, private identifiers, complete POAs, CUI, or controlled technical data. Configuration examples may contain only file IDs, tab IDs/names, approved ranges, non-secret status flags, and secret *references*.

## Stop condition

The repository currently has no approved Google tracker client or write identity. Therefore the only allowed implementation state is documentation plus human-controlled connected reads. Stop before code, credential creation, Apps Script installation, trigger changes, sharing changes, write tests, deployment, or production sync.
