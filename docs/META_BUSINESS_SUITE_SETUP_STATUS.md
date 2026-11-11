# Meta Business Suite Setup Status

Last updated: 2026-06-03

This tracker documents current account-side setup progress for local staging of
the 15-day campaign. It does not authorize posting, scheduling, ad spend, API
automation, or launch activity.

## Current Known Asset Structure

| Asset area | Current state | Notes |
| --- | --- | --- |
| 2Marines business portfolio | Present in the shared asset structure | Confirm exact portfolio ID in Meta Business settings before API work. |
| ShieldMate business portfolio | Present in the shared asset structure | Confirm exact portfolio ID in Meta Business settings before API work. |
| MarineCoin business portfolio | Present in the shared asset structure | Confirm exact portfolio ID in Meta Business settings before API work. |
| Shared ad account | `119729689` | Observed as connected across the 2Marines / ShieldMate / MarineCoin asset structure. |

Do not add payment details, access tokens, private account data, or screenshots
with sensitive account details to this repo.

## Setup Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Confirm Page ID | Pending | Verify in Meta Business settings for each Facebook Page used by the campaign. |
| Confirm Instagram business account | Pending | Verify the connected Instagram business account for each Meta-managed brand surface. |
| Confirm ad account connected to assets | In progress | Shared ad account `119729689` has been observed connected across the asset structure. |
| Confirm people assigned to ad account | Pending | Verify who has access in Meta Business settings; do not document private personal details here. |
| Confirm Yolanda/team invited | Pending | Record completion status only; do not document private emails or personal data. |
| Confirm billing/payment method active | Pending manual verification | Confirm account-side only; do not record card, bank, billing, or payment details. |
| Confirm Planner can select Facebook + Instagram | Pending | Verify inside Meta Business Suite Planner before staging Days 1-3. |
| Confirm Days 1-3 staged | Pending | Stage as drafts only after approvals and account selection are confirmed. |

## Security Notes

- No Meta access tokens, page tokens, app secrets, refresh tokens, or API keys go in the repo.
- No payment details, card details, bank details, billing addresses, or billing screenshots go in docs.
- No screenshots with sensitive account IDs beyond the approved shared ad account ID, private emails, private profile details, payment data, or access-token material should be committed.
- API automation remains read-only until explicitly approved.
- Mutating actions require human approval before any API or account-side action.
- Do not post, schedule, launch, or spend from local staging files.

## Manual Staging Workflow

Use the generated local staging drafts from:

```text
output/meta_staging/
```

Recommended sequence:

1. Confirm the correct business portfolio, Facebook Page, Instagram business account, and shared ad account are selected in Meta Business Suite.
2. Confirm the relevant row in `docs/marketing/codex-15-day-social-calendar.csv` has approval to stage.
3. Open the matching `output/meta_staging/day-*.txt` draft.
4. Stage Days 1-3 first as Meta Business Suite drafts.
5. Use the suggested final URL with UTM parameters.
6. Attach the approved creative asset and add alt text where supported.
7. Leave each item as a draft unless Joshua explicitly approves scheduling or publishing.
8. After staging, update the campaign CSV status with `update_campaign_status.py` once that local helper is available and approved for use.

If the status helper is not available, record staging status manually in a
separate local note and update the source CSV only after confirming the exact
approved status values.

## API Readiness

Current API posture: read-only checker only. No Meta API connection is approved
for this tracker.

Required `.env.local` keys for a future read-only checker should be placeholders
only until approved:

```text
META_BUSINESS_ID=
META_AD_ACCOUNT_ID=119729689
META_PAGE_ID=
META_INSTAGRAM_BUSINESS_ACCOUNT_ID=
META_ACCESS_TOKEN=
```

Do not commit `.env.local`. Do not add real token values to docs. Before any
mutating action is designed or run, require:

- Human approval for the exact action.
- Secret storage location approved.
- Dry-run mode as the default.
- Audit log format defined.
- Rollback or pause procedure documented.
- Confirmation that the action will not post, schedule, spend, or launch without explicit approval.
