# Ads Tracking Plan

Audit date: 2026-06-02

## Current Implementation

Existing analytics are centralized in `frontend/web/src/lib/firebase.ts` via Firebase Analytics:

- `measurementId` currently reads `VITE_FIREBASE_MEASUREMENT_ID` with fallback `G-9MBFJZQLGY`.
- `trackEvent(eventName, eventParams)` wraps Firebase `logEvent`.
- No GTM or raw `gtag` snippet was found in `frontend/web/index.html`.

Prepared target IDs:

- GTM container ID: `GTM-MT5NZ499`
- GA measurement ID: `G-WDTXVWYGXT`

Do not add both GTM and direct `gtag` tracking for the same events without an explicit analytics architecture decision. The lowest-risk GA alignment is to set `VITE_FIREBASE_MEASUREMENT_ID=G-WDTXVWYGXT` in the deployment environment. If GTM is required, add it once at the app shell or HTML entry and route event names through the same registry.

## Conversion Events

| Event name | Trigger | Notes |
| --- | --- | --- |
| `page_viewed` | Public route view | Already used in some resources pages; standardize route/title params. |
| `store_click` | Click to Shopify storefront | Include `brand`, `source_route`, `utm_campaign`. |
| `shopify_checkout_started` | Shopify checkout start | Placeholder; must be implemented in Shopify/GTM. |
| `shopify_purchase` | Shopify purchase complete | Placeholder; must be implemented in Shopify/GTM with revenue/currency/order id. |
| `app_store_click` | Apple App Store click | Include route and CTA placement. |
| `google_play_click` | Google Play click | Include route and CTA placement. |
| `lead_form_submit` | Contact/intake/partner form submit | Include form type and brand. |
| `signup_started` | Sign-up route CTA | Do not send PII. |
| `signup_completed` | Successful account creation | Use Firebase Auth event where available; no PII. |
| `donation_click` | Donation or fundraising CTA | Include campaign bucket. |
| `marinecoin_waitlist_submit` | Marine Coins waitlist submit | Include source route and campaign. |

## UTM Convention

Use lowercase values and hyphenated campaign names:

- `utm_source`: `google`, `meta`, `youtube`, `tiktok`, `linkedin`, `email`, `qr`, `canva`
- `utm_medium`: `cpc`, `organic-social`, `video`, `email`, `print`, `qr`, `referral`
- `utm_campaign`: `{brand}-{objective}-{quarter}`, for example `shieldmate-leads-2026q3`
- `utm_content`: `{platform}-{format}-{creative-slug}`, for example `instagram-reel-store-cta`

## Routes To Track

| Route | Priority events |
| --- | --- |
| `/` | `page_viewed`, `lead_form_submit`, app-store clicks |
| `/store` | `page_viewed`, `store_click` |
| `/shop` | `page_viewed`, `store_click` |
| `/shieldmate` | `page_viewed`, `signup_started`, app-store clicks |
| `/features` | `page_viewed`, `signup_started` |
| `/pricing` | `page_viewed`, `lead_form_submit` |
| `/contact` | `page_viewed`, `lead_form_submit` |
| `/marinecoin` | `page_viewed`, `marinecoin_waitlist_submit` |
| `/marinecoin/waitlist` | `page_viewed`, `marinecoin_waitlist_submit` |
| `/programs` | `page_viewed`, `lead_form_submit` |
| `/partners` | `page_viewed`, `lead_form_submit` |

## Google Ads Campaign Buckets

- `2marines-brand-search`: protect brand and direct-intent search.
- `shieldmate-veteran-support`: app/user acquisition around veteran support terms.
- `shieldmate-partner-orgs`: partner and nonprofit organization leads.
- `marinecoins-commerce`: Marine Coins physical product and store traffic.
- `remarketing-site-visitors`: remarket public site visitors with policy-compliant copy.

## Meta Campaign Buckets

- `2marines-mission-awareness`: mission and story content.
- `shieldmate-app-education`: app explainer and testimonials.
- `marinecoins-product-drop`: Marine Coins physical product drops.
- `partner-recruitment`: nonprofit and service-provider partner acquisition.
- `retargeting-engaged-visitors`: retarget engaged visitors and video viewers.

## Shopify Tracking Placeholder

Shopify purchase and checkout tracking should be configured inside Shopify and/or GTM:

- Storefront URL: `https://shieldmateapp.myshopify.com/`.
- Public route URL: `https://2marines.us/store`.
- Emit `shopify_checkout_started`.
- Emit `shopify_purchase` with order id, value, currency, product/category, and UTM attribution.
- Do not place Shopify admin URLs or private API credentials in the frontend.

## Social Destination Alignment

Use the final URL registry in `docs/marketing/marketing-links-registry.md` and `frontend/web/src/config/marketingLinks.ts` for campaign destinations. ShieldMate and Marine Coins YouTube/TikTok/LinkedIn destinations remain pending according to the channel status table, so campaigns should use the 2 Marines main channel unless an approved standalone destination is added later.

## App Store Click Placeholder

App-store CTAs should call centralized link registry URLs and emit:

- `app_store_click` for Apple.
- `google_play_click` for Google Play.

Use placeholder URLs until App Store Connect and Play Console product pages are live.
