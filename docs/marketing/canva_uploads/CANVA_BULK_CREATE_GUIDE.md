# Canva Bulk Create Guide

Use these files to generate draft creative from the 15-day, 3-brand, 3-time campaign calendar.

This is a design-production guide only. Do not publish directly from Canva unless Joshua explicitly approves it.

## Active Upload Files

Canva design size is chosen first. Use the split files in:

```text
docs/marketing/canva_uploads/by_time_and_size/
```

Pick the matching brand, time window, and size CSV before using Bulk Create.

Warning: Do not use archived mixed files for Canva production. Use only the `by_time_and_size` folder for the 135-row campaign.

Example:

1. Open a 1080 x 1080 Canva design.
2. Use `canva-2marines-morning-square-1080x1080.csv`.
3. Bulk Create the square Morning 2Marines posts.
4. Review every generated design.
5. Repeat for vertical and landscape.
6. Repeat for Morning, Afternoon, and Evening.
7. Repeat for each brand.
8. Do not publish directly from Canva.

Use this folder when Joshua needs production-ready Canva upload batches by business, time window, and design size.

## Before You Start

- Confirm you are using the correct brand template.
- Confirm no private data, tokens, billing details, account screenshots, or sensitive screenshots are in the design.
- Confirm Marine Coins copy stays focused on support, participation, mission commerce, and community impact.
- Do not add investment, ROI, profit, return, appreciation, security, yield, trading, token-gain, or guaranteed-return language.
- Keep all generated designs as drafts until reviewed and approved.

## Bulk Create Steps

1. Open Canva.
2. Create or open the correct template for the brand.
3. Open `Apps`.
4. Select `Bulk Create`.
5. Upload the matching CSV from this folder.
6. Connect CSV data fields to text boxes in the template.
7. Connect image or asset-note fields only if the template is set up for them.
8. Generate posts.
9. Review each generated design.
10. Confirm text fits, links are correct, and visuals match the brand lane.
11. Export approved posts.
12. Do not publish directly from Canva unless Joshua explicitly approves publishing.

## Suggested Field Mapping

| Canva text box | CSV field |
| --- | --- |
| Day label | `day` |
| Date label | `date` |
| Time window | `time_window` |
| Brand label | `brand` |
| Platform note | `platform` |
| Format note | `format` |
| Main headline | `headline` |
| Supporting body | `body` |
| CTA | `cta` |
| Link or QR source | `final_url` |
| Asset name | `asset_name` |
| Alt text note | `alt_text` |
| Visual direction | `visual_source` |
| Asset status note | `asset_status` |
| Production note | `needed_asset_notes` |
| Compliance note | `compliance_notes` |

## Design Sizes and Resize Workflow

Canva Bulk Create uses CSV fields for text and data placement. It does not automatically guarantee that each generated post is the correct platform size unless Joshua starts from the correct Canva design size or uses Canva resize and export steps.

Platform size mapping:

| Platform / format | Canva size |
| --- | --- |
| Instagram Square | 1080 x 1080 |
| Instagram Story | 1080 x 1920 |
| Facebook Link Post | 1200 x 628 |
| Facebook Square/feed | 1080 x 1080 |
| LinkedIn Single Image | 1080 x 1080 |
| LinkedIn Carousel | 1080 x 1080 per slide |
| YouTube Short | 1080 x 1920 |
| TikTok Vertical Video | 1080 x 1920 |

Recommended design-size-first production workflow:

1. Choose the Canva design size first.
2. Open the matching template for the brand and size.
3. Upload the matching CSV from `by_time_and_size`.
4. Use `asset_name` as the export naming base.
5. Review every generated design for size, crop, text fit, link accuracy, brand fit, and compliance.
6. Do not publish directly from Canva.
7. Export approved graphics for manual Meta draft staging.

Archived mixed files:

The `archive_old_mixed` folder is retained only for historical reference. Do not rely on a mixed-size CSV to create correctly sized Canva designs.

## Canva AI Starter Prompts

Split-file Canva generation prompt:

```text
Use the uploaded split CSV as the source of truth for this Canva design. The Canva design size has already been chosen before upload, so keep every generated design in this template size. Use each row's platform and format fields as labels and review checks, not as automatic resize instructions. Group output pages by day order. Use asset_name as the export naming base. Use each row's headline, body, CTA, final_url, visual_source, asset_status, needed_asset_notes, alt_text, and compliance_notes. Do not publish, schedule, post, boost, launch, or spend anything.

MarineCoin restrictions: no investment, no ROI, no profit, no financial return, no token appreciation, no asset appreciation, no securities framing, no yield, no trading, no token-gain, and no guaranteed-return language or imagery. Keep MarineCoin focused on support, participation, mission commerce, and community impact.

Privacy restrictions for all brands: no real client data, no private emails, no tokens, no billing data, no internal IDs, and no sensitive screenshots. Use demo-style mockups and public-safe brand visuals only.
```

2Marines square/static template prompt:

```text
Create a 1080 x 1080 square social media template for 2Marines. The design should feel mission-focused, practical, and community-centered. Include space for a short headline, supporting body copy, CTA, small URL or QR area, and 2Marines branding. Visual direction: veteran support, app department progress, referrals, housing resources, service navigation, and community coordination. Use clean structure, strong readability, and a calm professional style.
```

MarineCoin square/static template prompt:

```text
Create a 1080 x 1080 square social media template for Marine Coins. The design should focus on supporter commerce, participation, mission support, and community impact. Include space for a short headline, supporting body copy, CTA, small URL or QR area, and MarineCoin branding. Do not use investment, profit, ROI, return, appreciation, trading, yield, guaranteed-return, market chart, price movement, or financial-performance framing. Keep the message about what support helps build.
```

ShieldMate square/static template prompt:

```text
Create a 1080 x 1080 square social media template for ShieldMate. The design should communicate coming soon and pre-register for a calmer operations workspace. Include space for a short headline, supporting body copy, CTA, small URL or QR area, and ShieldMate branding. Visual direction: approval-driven workflows, role-based access, partner dashboards, intake, documents, audit logs, and organized support operations. Use only demo-style dashboard mockups and avoid real names, private account data, client records, emails, phone numbers, tokens, billing data, or sensitive screenshots.
```

## Review Checklist

- [ ] Correct brand template is used.
- [ ] Correct CSV is uploaded.
- [ ] Every generated post matches the intended brand lane.
- [ ] Headline, body, and CTA fit inside the design.
- [ ] Final URL includes the UTM fields.
- [ ] Visual asset is approved or clearly marked as needing a template or screenshot.
- [ ] Screenshots and mockups contain no sensitive data.
- [ ] Marine Coins posts contain no financial-return or market-framing language.
- [ ] Designs are exported only after review.
- [ ] Nothing is published, scheduled, boosted, launched, or spent without Joshua approval.
