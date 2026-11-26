# Ecosystem Tracker Connection

Verified: 2026-10-14
Status: documentation-only; no repository/runtime Google client or write automation authorized

## Authoritative sources

- Detailed master: [2Marines Ecosystem | Grants & Contracts Pipeline | October 2026](https://docs.google.com/spreadsheets/d/1EaJHJ9bDZS_jRA4KRe6mTcI6DmkQJ-wpcSTYXIGb_us/edit), with source identity recorded in `tracker-source-manifest.json` and ownership verified through the approved connected account.
- Daily summary/action surface: [Project tracker](https://chatgpt.com/space/page_99ef1fd4143c819196f5bdf34865a1ee), the Page linked from the workbook.
- Local compliance records: `docs/business-compliance/`. These hold templates, decisions, and evidence references; they are not a second independently maintained grant/contract pipeline.

The Page and workbook report an existing daily refresh around 6:00 a.m. `America/New_York`. That is a connected ChatGPT automation, not repository code and not a deployment authorized by this document. Do not duplicate it.

## Access determination

This interactive Codex session verified Google metadata and bounded cell reads through the connected owner account. It did not edit the workbook. The verified visible tabs are recorded in `tracker-source-manifest.json`.

Repository inspection found Google Drive readiness artifacts but no live Sheets client, tracker-specific configuration, dedicated service identity, or credential path:

- `platform_bootstrap/integrations/google_drive/configs/google_drive_config.template.json`
- `platform_bootstrap/integrations/google_drive/consumer_map.json`
- `ops/MCP_DEPLOY_RUNBOOK.md`
- `docs/MCP_ENV_VARS.md`

The template uses a read-only Drive scope and expects workload identity or Secret Manager, but the runtime packages consume local bootstrap data. Connected ChatGPT access does not transfer credentials to repository scripts, MCPs, local shells, or deployed services.

## Exact missing runtime capability

The repository lacks all of the following for direct tracker access:

1. an owner-approved Google Cloud/Workspace identity dedicated to this workload;
2. file-specific access for that identity to this spreadsheet;
3. an enabled and configured Google Sheets API client (and Drive metadata/export API only if needed);
4. a non-secret configuration binding the file ID and scopes to that identity;
5. Secret Manager or workload-identity wiring and an operator-approved execution environment;
6. read verification, version/conflict checks, audit logging, and an approved write policy.

No Google password, refresh token, OAuth client secret, service-account private key, or full account credential belongs in Git, tracker cells, logs, screenshots, or tickets.

## Owner authorization path

If repository/runtime read access is needed:

1. Choose a dedicated Workspace/Google Cloud identity for ShieldMate automation. Prefer workload identity or an organization-managed service account for a server workload; do not use a person's password or domain-wide delegation.
2. In an owner-approved Google Cloud project, enable the Google Sheets API. Enable Drive API only for file metadata or controlled export requirements.
3. Share only this spreadsheet with the dedicated identity as **Viewer**.
4. Grant `https://www.googleapis.com/auth/spreadsheets.readonly` and, only if metadata discovery is required, `https://www.googleapis.com/auth/drive.metadata.readonly`. Use `drive.readonly` only when a controlled file export is actually required.
5. Bind identity at runtime through workload identity or Secret Manager; keep only non-secret file IDs, ranges, and policy flags in configuration.
6. Verify file metadata, expected title, expected tab IDs/names, and small bounded reads. Record the actor, source version/modified time, range, and result without logging sensitive cell content.
7. Keep the integration read-only until the owner separately authorizes a write design and grants file-specific Editor access plus the minimum Sheets write scope.

No setup step above authorizes workbook writes, Apps Script installation, schedule changes, public sharing, or deployment.

## Read-only snapshot fallback

If connected read access is unavailable, the owner may export a dated, read-only snapshot from the master. Store it only in an approved access-controlled location and label it:

- source spreadsheet ID and title;
- owner-provided export timestamp and time zone;
- source modified/version time if available;
- included tabs and excluded sensitive columns;
- SHA-256 hash;
- `READ_ONLY_SNAPSHOT_NOT_MASTER`;
- retention owner and next refresh date.

Suggested non-secret name: `ecosystem-tracker-YYYYMMDDTHHMMSSZ.read-only.xlsx`. Do not check a snapshot into Git until its data classification, minimization, access control, retention, and `.gitignore` treatment are approved. No snapshot was created in this pass because live read access was verified.

## Sensitive-data boundary

The workbook and Page may hold task status, dates, organization roles, official source links, and links to controlled evidence. They must not hold passwords, private keys, refresh tokens, bank details, full customs/POA identifiers, CUI, classified material, export-controlled technical data, or restricted-party evidence beyond the minimum case/status reference appropriate for their approved access.
