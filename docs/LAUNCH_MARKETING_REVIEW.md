# Launch Marketing Review

Last updated: 2026-06-03

## Scope

This review covers launch marketing readiness for 2 Marines, ShieldMate, and Marine Coins. This launch cycle is a 15-day campaign. The 90-day framework is future expansion only and is not part of the current commit.

This is a prelaunch review only. It does not approve publishing, paid media launch, deployment, billing changes, or account access changes.

## Source Materials

- `docs/marketing/codex-15-day-social-calendar.csv`
- `docs/marketing/canva-bulk-csv-schema.md`
- `docs/marketing/marketing-links-registry.md`
- `docs/marketing/ads-tracking-plan.md`
- `docs/google-ads-approvals.md`
- `docs/mcp-google-ads.md`

## Current Local Status

- A 15-row social calendar CSV exists at `docs/marketing/codex-15-day-social-calendar.csv`.
- The 15-day CSV is the only marketing CSV in scope for this launch cycle.
- No 90-day Canva CSV files are needed for the current launch commit.
- The public website contact email should be `info@2marines.us`.
- Marine Coins customer-facing copy should use `Marine Coins` where possible. Existing technical names such as `marinecoin` may remain for routes, build keys, or hosting targets.
- Google Ads launch remains gated by explicit approval.
- Meta post staging and account access changes require authenticated Meta Business access.

## 15-Day CSV Readiness

Recommended columns for the active 15-day CSV:

`day,date,brand,platform,format,content_pillar,post_title,headline,body,cta,primary_url,utm_source,utm_medium,utm_campaign,utm_content,qr_url,image_prompt,asset_name,alt_text,approval_status,scheduled_status`

CSV upload readiness checks:

- Confirm the CSV parses cleanly with 15 rows.
- Confirm `approval_status` is present and every row starts as `draft`.
- Confirm `scheduled_status` is present and every row starts as `not_staged`.
- Confirm no row points to private dashboards, admin URLs, or placeholder-only destinations.
- Confirm any Meta upload uses only the Facebook and Instagram rows unless approved variants are created.

## 15-Day UTM Convention

- `utm_source`: `facebook`, `instagram`, `google`, or `linktree`
- `utm_medium`: `social`, `paid_social`, `paid_search`, or `organic`
- `utm_campaign`: `15day_launch_test`
- `utm_content`: `{brand}_{day}_{format}`

## Review Checklist

- Confirm every launch asset uses the correct brand lane: 2 Marines, ShieldMate, or Marine Coins.
- Confirm public contact references use `info@2marines.us`.
- Confirm Firebase operational account references remain separate from public contact copy.
- Confirm links match `docs/marketing/marketing-links-registry.md`.
- Confirm Shopify destinations point to the approved public storefront, not an admin URL.
- Confirm Marine Coins copy does not describe the product as a cryptocurrency, security, investment, token, yield product, or promise of profit.
- Confirm ShieldMate copy stays grounded in workflow, coordination, and support operations.
- Confirm all campaign URLs include approved UTM conventions before launch.
- Confirm no secrets, private API keys, billing details, or account tokens appear in creative or docs.

## Approval Gates

- Meta posts may be drafted or scheduled only after account owner review.
- Google Ads changes may be drafted and reviewed, but not executed until approved.
- Any paid campaign budget, bid, conversion action, billing, or audience change requires explicit approval.
- Any website deployment requires a separate deployment approval.

## Open Items

- Confirm the final Meta Business assets and ad account IDs in the account UI.
- Confirm the team member email addresses and roles for Meta access.
- Confirm whether all 15 calendar rows should become Meta posts, or whether only Facebook and Instagram rows should be staged in Meta Business Suite.
- Confirm final App Store and Google Play URLs after store records exist.
