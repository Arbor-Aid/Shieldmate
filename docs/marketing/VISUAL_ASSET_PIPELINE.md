# Visual Asset Pipeline

Last updated: 2026-06-04

## Scope

This pipeline supports the active 15-day campaign across the 2Marines, MarineCoin, and ShieldMate lanes. It is a planning and production guide only. It does not approve publishing, paid media launch, account access changes, screenshots from production systems, or deployment.

The campaign does not need 45 unique images at first. Start with 9 reusable Canva templates, then reuse those templates with different headlines, platform crops, and calls to action.

## CSV Fields

The campaign CSV should include these visual asset fields:

- `visual_source`: the intended visual lane for the post.
- `asset_status`: `ready`, `needs_canva_template`, or `needs_screenshot`.
- `canva_template_type`: the reusable Canva template family.
- `needed_asset_notes`: the exact asset dependency or safety note for production.

Use `asset_status=needs_canva_template` when a real image is not available. Use `asset_status=needs_screenshot` when an app, dashboard, checklist screen, or storefront preview must be captured. Use `asset_status=ready` when the logo or an existing brand image is enough for the first draft.

## Reusable Template Starter Set

Create these 9 templates first:

| Brand | Template type | Primary use |
| --- | --- | --- |
| 2Marines | `2marines-app-screenshot-card` | App department screenshots and checklist phone visuals |
| 2Marines | `2marines-mission-graphic` | Mission stories, program reminders, and vertical thumbnails |
| 2Marines | `2marines-community-logo-overlay` | Community/outreach photos and logo-backed partner posts |
| MarineCoin | `marinecoin-product-mockup-card` | Product mockups and detail posts |
| MarineCoin | `marinecoin-mission-commerce-graphic` | Mission-commerce graphics and logo-backed reminders |
| MarineCoin | `marinecoin-store-preview-frame` | Shopify/store preview posts |
| ShieldMate | `shieldmate-dashboard-mockup` | Dashboard, approval, intake, and partner workflow mockups |
| ShieldMate | `shieldmate-checklist-graphic` | Claims, access, trust, and checklist explainer graphics |
| ShieldMate | `shieldmate-pre-register-card` | Pre-register, request-info, and waitlist-style CTA cards |

## Visual Lanes

2Marines visuals can use app department screenshots, mission graphics, community/outreach photos, and 2Marines logo graphics.

MarineCoin visuals can use product mockups, mission-commerce graphics, Shopify/store previews, and MarineCoin logo graphics.

ShieldMate visuals can use ShieldMate dashboard mockups, checklist graphics, pre-register cards, and ShieldMate logo graphics.

## Reuse Rules

Reuse each Canva template with different headlines before creating one-off art. Swap the headline, CTA, crop, platform size, and brand-safe background while keeping the system recognizable.

Prioritize reusable templates in this order:

1. Square/static templates for Instagram, Facebook, and LinkedIn.
2. Vertical templates for Stories, Shorts, and TikTok.
3. Carousel cover and interior slide templates once the first static set is approved.

## Safety Rules

MarineCoin visuals must avoid financial-return imagery or claims. Do not use investment charts, token price visuals, yield language, profit language, crypto trading metaphors, or anything that implies upside or financial performance.

Use screenshots and mockups only after sensitive data is removed. Remove names, emails, phone numbers, client records, partner identifiers, internal IDs, private URLs, admin screens, tokens, keys, billing details, and any live operational data.

Use public storefront screenshots only after Shopify products and URLs are final. Do not use Shopify admin screenshots in campaign creative.

Community/outreach photos should be approved for public use. Avoid identifiable people unless consent and usage rights are confirmed.

## Production Flow

1. Confirm the row's `visual_source` and `asset_status` in the campaign CSV.
2. If `needs_screenshot`, capture a demo-data or public-only screenshot and scrub sensitive data before importing it into Canva.
3. If `needs_canva_template`, build from the matching reusable template type.
4. If `ready`, place the existing logo or brand image into the matching template and update the headline.
5. Export the asset for the platform format and keep the campaign `asset_name` as the file naming base.
6. Review brand fit, copy safety, data scrubbing, cropping, and alt text before staging anywhere.
