# Meta Post Staging Checklist

Last updated: 2026-06-03

## Scope

This checklist is for staging organic Facebook and Instagram posts in Meta Business Suite for the active 15-day campaign. The 90-day framework is future expansion only and is not part of the current commit.

This is not approval to publish, boost, advertise, or change billing.

## Source Calendar

Use `docs/marketing/codex-15-day-social-calendar.csv` as the launch calendar source.

The current CSV contains 15 total rows across multiple platforms. For Meta Business Suite, stage rows where `platform` is `Facebook` or `Instagram`. If the launch needs 15 Meta calendar days, create approved Facebook and Instagram variants for the non-Meta rows inside the 15-day campaign only.

Do not create or stage 90-day Canva CSV files for this cycle.

## CSV Upload Readiness

Recommended 15-day CSV columns:

`day,date,brand,platform,format,content_pillar,post_title,headline,body,cta,primary_url,utm_source,utm_medium,utm_campaign,utm_content,qr_url,image_prompt,asset_name,alt_text,approval_status,scheduled_status`

- Confirm `approval_status` is `draft` before staging.
- Confirm `scheduled_status` is `not_staged` before staging.
- Update `scheduled_status` only after a Meta draft or schedule has been created.
- Keep final approval separate from scheduling status.

## UTM Convention

- Facebook rows use `utm_source=facebook`.
- Instagram rows use `utm_source=instagram`.
- Organic Meta posts use `utm_medium=social`.
- Paid Meta tests, if later approved, use `utm_medium=paid_social`.
- All 15-day rows use `utm_campaign=15day_launch_test`.
- `utm_content` should follow `{brand}_{day}_{format}`.

## Pre-Staging Checks

- Confirm the correct Meta Business portfolio is selected.
- Confirm the correct Facebook Page and Instagram account are selected.
- Confirm post timezone and schedule timezone.
- Confirm every post is saved as draft or scheduled only after approval.
- Confirm no paid promotion, boost, or ad objective is enabled.
- Confirm all links are public URLs.
- Confirm Shopify links point to the public storefront.
- Confirm public email references use `info@2marines.us`.
- Confirm Marine Coins copy avoids investment, crypto, token, yield, or profit language.
- Confirm all images are approved and match the brand lane.

## Meta Row Handling

- Facebook rows: stage in the Facebook Page composer.
- Instagram feed rows: stage in the Instagram composer.
- Instagram Story rows: stage as Story content only if the asset format is approved.
- LinkedIn, TikTok, and YouTube rows: do not stage in Meta Business Suite unless an approved Meta-specific variant is created.

## Staging Record

| Row ID | Brand | Platform | Planned Date | Meta Destination | Draft URL or Status | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending | Facebook or Instagram | Pending | Pending | Not staged | Pending |

## Final Review Before Scheduling

- Check spelling, grammar, and brand names.
- Click every link in preview.
- Confirm the CTA matches the destination.
- Confirm images do not crop badly in feed or story preview.
- Confirm schedule date and time.
- Confirm the post is not boosted.

## Blockers

- Meta Business Suite requires an authenticated account session.
- Staging cannot be completed from repo docs alone.
- Team access and billing permissions must be handled in Meta Business settings.
