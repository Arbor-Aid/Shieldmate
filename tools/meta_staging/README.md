# Meta Staging Generator

This tool creates local-only staging files for the 15-day campaign CSV.

It does not connect to Meta, does not post content, does not schedule content,
and does not use secrets.

## Setup

From the repository root:

```powershell
python --version
```

No third-party Python packages are required.

## Run

```powershell
python tools/meta_staging/generate_meta_staging.py
```

Input:

```text
docs/marketing/codex-15-day-social-calendar.csv
```

Output:

```text
output/meta_staging/
```

The output folder contains one text staging draft per campaign row, a
`meta_staging_checklist.csv` tracker, and an output README with usage notes.

## No Secrets

Do not add Meta access tokens, app secrets, page tokens, business IDs, ad
account credentials, refresh tokens, or API keys to this tool or the campaign
CSV. This generator is intentionally offline and safe for local review.

## Later API Integration Plan

If Meta API integration is approved later, keep it separate from this local
generator until the following are defined:

- Meta app and Business Manager ownership.
- Secret storage location for access tokens.
- Page and Instagram account IDs.
- Required review permissions.
- Human approval gate for staging, scheduling, and publishing.
- Audit log format for every API action.
- Dry-run mode that is the default.

Publishing or scheduling should remain disabled unless Joshua explicitly
approves a production API workflow.
