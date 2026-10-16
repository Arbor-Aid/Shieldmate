# Google Ads Prelaunch Review

Last updated: 2026-06-03

## Scope

This document is for reviewing a prestaged Google Ad or Google Ads change request before launch in the active 15-day campaign. The 90-day framework is future expansion only and is not part of the current commit.

This does not approve launching, executing, budget changes, bid changes, conversion changes, or billing changes.

## Source Materials

- `docs/google-ads-approvals.md`
- `docs/mcp-google-ads.md`
- `docs/marketing/ads-tracking-plan.md`
- `frontend/web/src/pages/AdminApprovals.tsx`
- `frontend/web/src/pages/AdminApprovalNew.tsx`

## Current Repo-Side Findings

- The approval workflow supports draft, submit, approve, reject, and execute states.
- Google Ads mutations are intended to be routed through MCP and approval logging.
- The local Google Ads MCP service skeleton exposes health and metadata behavior, but the repo review did not confirm a live prestaged ad in Google Ads.
- No Google Ads launch or external mutation has been performed.

## 15-Day Campaign UTM Rules

- Google Ads prelaunch URLs use `utm_source=google`.
- Paid search URLs use `utm_medium=paid_search`.
- Paid social URLs, if any are reviewed here for cross-channel consistency, use `utm_medium=paid_social`.
- All test URLs use `utm_campaign=15day_launch_test`.
- `utm_content` should follow `{brand}_{day}_{format}` or the closest ad asset equivalent.

## Prelaunch Checklist

- Confirm the Google Ads account is the approved account.
- Confirm the campaign type and objective.
- Confirm the ad is still draft, paused, or otherwise not live.
- Confirm the ad grant or paid account policy requirements.
- Confirm final URL is approved and public.
- Confirm UTM parameters match the tracking plan.
- Confirm headline, description, and CTA are accurate.
- Confirm no prohibited claims are present.
- Confirm budget, bidding, geography, audience, and schedule are intentional.
- Confirm conversion actions are correct and already tested.
- Confirm approval record exists before execution.

## Approval Gates

- Draft review may happen before approval.
- Submission to approval queue may happen only when the reviewer is ready.
- Execution must wait for explicit approval.
- Launch must not happen from a local script or unlogged account action.
- Supervised agent or MCP execution may prepare an approval record, but it must not execute a Google Ads mutation without explicit approval.

## Review Record

| Field | Value |
| --- | --- |
| Google Ads account | Pending account-side confirmation |
| Campaign | Pending |
| Ad group | Pending |
| Ad or asset ID | Pending |
| Final URL | Pending |
| Budget impact | Pending |
| Reviewer | Pending |
| Approval status | Not approved |

## Blockers

- Account-side Google Ads access is required to verify the actual prestaged ad.
- Billing, launch, and mutating changes require explicit approval.
- Any API credentials must stay outside the repo.
