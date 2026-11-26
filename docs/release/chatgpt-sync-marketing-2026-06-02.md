# ChatGPT Sync - Marketing, Shopify, and Public Hub

Date: 2026-06-02

Repo authority:

- Canon repo path: `D:\2marines\Shieldmate`
- Branch: `ui-rebuild-flutter-gen-ui`
- ShieldMate Canon v2.0 remains authoritative.
- Repo reality is source of truth.
- Do not use stale path `D:\shieldmatessd\Shieldmate_RECLONE` unless explicitly told.

## Firebase Hosting Recovery Status

- Live Firebase rollback is stable.
- Hosting site: `marines-ai-agent`
- Rolled back from Firebase release `162edb` to `d0d363`.
- Joshua visually confirmed these public URLs restored:
  - `https://www.2marines.us`
  - `https://2marines.us`
  - `https://www.2marines.us/shieldmate`
  - `https://shieldmate.2marines.us`
  - `https://marinecoin.2marines.us`
- The Shopify route redirects worked, but prior live deploy regressed the whole public hub artifact.
- Root issue: `marines-ai-agent` was pointed at `frontend/web/dist` instead of the previous public hub artifact.
- Current repaired `firebase.json` state uses Hosting target `marines-ai-agent`, public directory `public`, and route-level redirects for `/store` and `/shop`.
- Do not deploy `public/index.html`; it is not proven to be the true 2Marines public hub artifact.

## Public Hub Artifact Status

- True restored 2Marines public hub is not `public/index.html`.
- Best candidate source remains the Dec 29 root Vite app around git commit `09c4cf6`.
- Nearby dirty/WIP source from `9b0da3fa` was needed to reproduce missing files in a throwaway worktree.
- Throwaway worktree used for reproduction:
  - `D:\2marines\_preview_worktrees\shieldmate-09c4cf6-public-hub`
- Local preview worked at:
  - `http://127.0.0.1:5179/`
- Local QA found preview drift:
  - `/` on localhost renders standalone ShieldMate because of host gating.
  - `/marinecoin` on localhost renders standalone MarineCoin because of host gating.
  - `/store` was 404 in that local throwaway app route table.
  - title metadata had replacement-character encoding in the throwaway artifact.
- Remaining blocker before Firebase preview:
  - The true public hub artifact must be identified, corrected, locally previewed, and visually approved before any Firebase preview or live deploy.

## Shopify and Store Registry

Current intended registry:

| Key | Value |
| --- | --- |
| `SHOPIFY_STORE_URL` | `https://shieldmateapp.myshopify.com/` |
| `2MARINES_STORE_URL` | `https://2marines.us/store` |
| `2MARINES_STORE_CANONICAL_ROUTE` | `/store` |
| `2MARINES_STORE_LEGACY_ALIAS` | `/shop` |

Current route behavior:

- `/store` is the canonical Shopify handoff.
- `/shop` is the legacy alias and also hands off to Shopify.
- `firebase.json` redirects both `/store` and `/shop` to `https://shieldmateapp.myshopify.com/`.
- `frontend/web/src/App.tsx` routes both `/shop` and `/store` to `StoreRedirect`.
- `frontend/web/src/pages/twomarines/StoreRedirect.tsx` redirects using `SHOPIFY_STORE_URL` from `frontend/web/src/config/marketingLinks.ts`.
- `frontend/web/src/components/layout/TwoMarinesNavbar.tsx` Shop link points to `/store`.
- `frontend/web/src/components/layout/TwoMarinesFooter.tsx` Shop link points to `/store`.
- Active use of `shieldmate-4139.myshopify.com` was removed/replaced.

Files changed for Shopify/public hub alignment:

- `frontend/web/.env.2marines`
  - `VITE_SHOPIFY_STORE_URL="https://shieldmateapp.myshopify.com/"`
- `frontend/web/src/config/shop.ts`
  - Re-exports `SHOPIFY_STORE_URL` from `./marketingLinks` so it cannot drift from the registry default.

Build verification:

- Ran local build only:
  - `npm run build:2marines`
- Result:
  - Build succeeded.
  - Warnings only: stale Browserslist data and large chunks.
  - No Browserslist update was run.

## Hard Stops

Do not do any of the following without explicit approval:

- Deploy live.
- Run Firebase preview deploy.
- Mutate Firebase.
- Change DNS.
- Commit.
- Push.
- Stage.
- Run `git add`.
- Run `npm audit fix`.
- Update Browserslist/caniuse-lite.
- Touch functions, Firestore rules, storage rules, claims schema, RBAC, App Check, gateway validation, `mcp/common`, or frontend auth.
- Point `marines-ai-agent` back to `frontend/web/dist`.
- Deploy `public/index.html`.
- Assume current `frontend/web` is safe for live deploy without controlled preview.
