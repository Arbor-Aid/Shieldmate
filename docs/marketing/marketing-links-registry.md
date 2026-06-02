# Marketing Links Registry

Audit date: 2026-06-02

## Runtime Registry

The web runtime registry lives at:

- `frontend/web/src/config/marketingLinks.ts`

It centralizes public marketing URLs for:

- 2 Marines
- ShieldMate
- Marine Coins, the physical products/store brand
- 2marines.us canonical website
- 2 Marines Linktree
- Facebook, Instagram, YouTube, TikTok, LinkedIn URLs and pending channel statuses
- Shopify storefront URL
- Apple App Store URL placeholder
- Google Play URL placeholder

## Final Captured URLs

| Key | Value |
| --- | --- |
| `SHOPIFY_STORE_URL` | `https://shieldmateapp.myshopify.com/` |
| `2MARINES_WEBSITE_URL` | `https://2marines.us` |
| `SHIELDMATE_WEBSITE_URL` | `https://2marines.us/shieldmate` |
| `2MARINES_STORE_URL` | `https://2marines.us/store` |
| `MARINECOIN_WEBSITE_URL` | `https://2marines.us/marinecoin` |
| `SHIELDMATE_SUBDOMAIN_URL` | `https://shieldmate.2marines.us/` |
| `MARINECOIN_SUBDOMAIN_URL` | `https://marinecoin.2marines.us/marinecoin` |

Customer-facing copy should use **Marine Coins** where possible. Technical routes and keys may remain `marinecoin` where that is already the repo convention.

## Social Registry

| Brand | Platform | URL | Handle/status |
| --- | --- | --- | --- |
| 2 Marines | Facebook | `https://www.facebook.com/2Marines` | `@2Marines` |
| ShieldMate | Facebook | `https://www.facebook.com/profile.php?id=61590465844563` | `PENDING` |
| Marine Coins | Facebook | `https://www.facebook.com/profile.php?id=61590719603751` | `PENDING` |
| 2 Marines | Instagram | `https://www.instagram.com/weldingking87/` | `@weldingking87` |
| ShieldMate | Instagram | `https://www.instagram.com/shieldmate1/` | `@shieldmate1` |
| Marine Coins | Instagram | `https://www.instagram.com/marinecoin1/` | `@marinecoin1` |
| 2 Marines | Linktree | `https://linktr.ee/2Marines` | `@2Marines` |
| 2 Marines | YouTube | `https://www.youtube.com/@2marines` | `@2marines` |
| 2 Marines | LinkedIn | `https://www.linkedin.com/company/2marines/` | `2marines` |
| 2 Marines | TikTok | `https://www.tiktok.com/@2marines87` | `@2marines87` |

## Pending Channel Status

| Item | Status |
| --- | --- |
| `SHOPIFY_SOCIAL_LINKS_STATUS` | `DONE` |
| `SHOPIFY_FOOTER_MENU_STATUS` | `DONE` |
| `SHOPIFY_FOOTER_MENU_NAME` | `2 Marines Ecosystem` |
| `SHIELDMATE_YOUTUBE_STATUS` | `PENDING_PLAYLIST_ONLY` |
| `MARINECOIN_YOUTUBE_STATUS` | `PENDING_PLAYLIST_ONLY` |
| `SHIELDMATE_TIKTOK_STATUS` | `PENDING_USE_2MARINES_MAIN` |
| `MARINECOIN_TIKTOK_STATUS` | `PENDING_USE_2MARINES_MAIN` |
| `SHIELDMATE_LINKEDIN_STATUS` | `PENDING_SHOWCASE_PAGE` |
| `MARINECOIN_LINKEDIN_STATUS` | `PENDING_SHOWCASE_PAGE` |

## Environment Variables

Runtime config uses final captured URLs as defaults and allows deployment environment overrides:

| Purpose | Env var |
| --- | --- |
| 2 Marines website | `VITE_TWO_MARINES_URL` |
| 2 Marines store route | `VITE_TWO_MARINES_STORE_URL` |
| ShieldMate website/product URL | `VITE_SHIELDMATE_URL` |
| ShieldMate subdomain | `VITE_SHIELDMATE_SUBDOMAIN_URL` |
| Marine Coins website/product URL | `VITE_MARINE_COINS_URL` |
| Marine Coins subdomain | `VITE_MARINE_COINS_SUBDOMAIN_URL` |
| Joshua McAllister Linktree | `VITE_JOSHUA_LINKTREE_URL` |
| 2 Marines Linktree | `VITE_TWO_MARINES_LINKTREE_URL` |
| Main Facebook | `VITE_FACEBOOK_URL` |
| 2 Marines Facebook | `VITE_TWO_MARINES_FACEBOOK_URL` |
| ShieldMate Facebook | `VITE_SHIELDMATE_FACEBOOK_URL` |
| Marine Coins Facebook | `VITE_MARINE_COINS_FACEBOOK_URL` |
| Main Instagram | `VITE_INSTAGRAM_URL` |
| 2 Marines Instagram | `VITE_TWO_MARINES_INSTAGRAM_URL` |
| ShieldMate Instagram | `VITE_SHIELDMATE_INSTAGRAM_URL` |
| Marine Coins Instagram | `VITE_MARINE_COINS_INSTAGRAM_URL` |
| Main YouTube | `VITE_YOUTUBE_URL` |
| 2 Marines YouTube | `VITE_TWO_MARINES_YOUTUBE_URL` |
| Main TikTok | `VITE_TIKTOK_URL` |
| 2 Marines TikTok | `VITE_TWO_MARINES_TIKTOK_URL` |
| Main LinkedIn | `VITE_LINKEDIN_URL` |
| 2 Marines LinkedIn | `VITE_TWO_MARINES_LINKEDIN_URL` |
| Shopify storefront | `VITE_SHOPIFY_STORE_URL` |
| Apple App Store | `VITE_APP_STORE_URL` |
| Google Play | `VITE_GOOGLE_PLAY_URL` |

## Current Behavior

- `/store` reads `VITE_SHOPIFY_STORE_URL` through `frontend/web/src/config/marketingLinks.ts`.
- If `VITE_SHOPIFY_STORE_URL` is configured, `/store` performs a client-side redirect to that storefront.
- If it is missing, `/store` uses the final captured default storefront URL: `https://shieldmateapp.myshopify.com/`.
- No Shopify admin URL is hard-coded in the new `/store` registry or route.

Existing dirty Shopify work was left untouched:

- `frontend/web/.env.2marines`
- `frontend/web/src/config/shop.ts`
- `frontend/web/src/pages/twomarines/TwoMarinesShop.tsx`

## Account-Side Paste List

Joshua should paste final account URLs into Firebase Hosting/CI/Vite environment configuration for the deployment target:

- App Store product URL after App Store Connect record exists.
- Google Play product URL after Play Console record exists.
- Any future ShieldMate or Marine Coins standalone YouTube/TikTok/LinkedIn destination after the pending statuses are resolved.
