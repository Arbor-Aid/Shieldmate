# Deploy and Verify Runbook

Audit date: 2026-06-03

This runbook documents target-specific deployment and verification commands. It is not approval to deploy. Do not run any deploy command until Joshua explicitly approves the target and deployment window.

## Target Rule

Always deploy the Firebase Hosting target that matches the custom domain being tested.

| Domain | Hosting target | Hosting site |
| --- | --- | --- |
| `2marines.us`, `www.2marines.us` | `marines-ai-agent` | `marines-ai-agent` |
| `shieldmate.2marines.us` | `shieldmate` | `2m-shieldmate-48cad` |
| `marinecoin.2marines.us` | `marinecoin` | `marinecoin-2marines` |

Do not run plain `firebase deploy`. Do not deploy Functions, Firestore rules, Storage rules, MCP services, or gateway changes as part of a Hosting-only release.

## Deploy Commands

2Marines:

```powershell
npm --prefix frontend/web run build:2marines
firebase deploy --only hosting:marines-ai-agent --project marines-ai-agent
```

ShieldMate:

```powershell
npm --prefix frontend/web run build:shieldmate
firebase deploy --only hosting:shieldmate --project marines-ai-agent
```

MarineCoin:

```powershell
npm --prefix frontend/web run build:marinecoin
firebase deploy --only hosting:marinecoin --project marines-ai-agent
```

## Pre-Deploy Checks

Run from the approved clean deployment worktree only.

```powershell
git status --short
git diff --stat
firebase use
firebase hosting:sites:list --project marines-ai-agent
```

Confirm before deploy:

- Human approval exists for the specific target.
- Worktree is clean or contains only approved release changes.
- `firebase.json` has the correct hosting target.
- The target build command matches the target brand.
- No source code, Functions, Firestore rules, Storage rules, claims, App Check, MCP gateway, or MCP service changes are included unless separately approved.
- No secrets appear in the diff.

## Local Build Verification

After each target build, inspect the generated output before deploying.

Public `frontend/web/index.html` uses safe static default metadata. Site-specific
metadata may be handled later through a safe metadata injection strategy. Raw
`%VITE_*` placeholders must never ship to production or built output.

```powershell
npm --prefix frontend/web run build:2marines
Select-String -Path frontend/web/dist/index.html -Pattern "2Marines","2 Marines","info@2marines.us"
```

```powershell
npm --prefix frontend/web run build:shieldmate
Select-String -Path frontend/web/dist/index.html -Pattern "ShieldMate","info@2marines.us"
```

```powershell
npm --prefix frontend/web run build:marinecoin
Select-String -Path frontend/web/dist/index.html -Pattern "MarineCoin","Marine Coins","info@2marines.us"
```

If brand text is bundled in hashed JS assets rather than `index.html`, search the whole build:

```powershell
Select-String -Path frontend/web/dist/**/* -Pattern "2Marines","ShieldMate","MarineCoin","Marine Coins","info@2marines.us" -ErrorAction SilentlyContinue
```

Confirm no raw metadata placeholders are present:

```powershell
Select-String -Path frontend/web/dist/**/* -Pattern "%VITE_" -ErrorAction SilentlyContinue
```

## Post-Deploy Verification

Custom domains:

```powershell
curl.exe -L https://2marines.us/
curl.exe -L https://shieldmate.2marines.us/
curl.exe -L https://marinecoin.2marines.us/
```

web.app fallbacks:

```powershell
curl.exe -L https://marines-ai-agent.web.app/
curl.exe -L https://2m-shieldmate-48cad.web.app/
curl.exe -L https://marinecoin-2marines.web.app/
```

Brand/content checks:

- `https://2marines.us` shows the intended 2Marines main experience.
- `https://shieldmate.2marines.us` shows the intended ShieldMate experience.
- `https://marinecoin.2marines.us` shows the intended MarineCoin experience.
- Public contact email is `info@2marines.us`.

Shopify redirects where intended:

```powershell
curl.exe -I https://2marines.us/shop
curl.exe -I https://2marines.us/store
curl.exe -I https://shieldmate.2marines.us/shop
curl.exe -I https://shieldmate.2marines.us/store
```

Expected for current routing/config: 2Marines and ShieldMate `/shop` and `/store` hand off to `https://shieldmateapp.myshopify.com/`. MarineCoin Hosting should not add Shopify redirects unless a future approved routing decision requires them.

MCP gateway:

```powershell
curl.exe -i "$env:MCP_GATEWAY_BASE_URL/health"
curl.exe -i -X POST "$env:MCP_GATEWAY_BASE_URL/mcp/execute" -H "Content-Type: application/json" -d "{\"toolId\":\"mcp-google-ads\",\"input\":{}}"
```

Expected:

- `/health` returns public health unless Cloud Run IAM intentionally blocks unauthenticated access.
- Protected execution without auth returns 401 or 403.

Auth and role behavior:

- Login works on the custom domain.
- Logout clears app session state.
- `/admin/rbac` requires `super_admin`.
- `/app/admin*` requires `admin` or `super_admin`.
- `/app/org*` requires `organization`, `org_admin`, or `staff`.
- `/app/user*` requires `client`.
- `/admin/approvals` page-level access requires `super_admin` or org-scoped `org_admin`.

External link placeholders:

- Meta/Facebook/Instagram links are valid public URLs or clearly pending.
- Google Ads execution remains approval-gated.
- Shopify public storefront links route to the approved storefront.
- Google Play and Apple App Store links are placeholders or valid public URLs only.

Secret check:

```powershell
git diff -- . ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.ico' | rg -i "secret|private key|refresh_token|access_token|service account|shopify.*token|google_ads.*token|meta.*token|apple.*private|openai_api_key"
```

Expected: no real secrets. Public Firebase web config and public URLs are not treated as long-lived secrets, but do not add new credentials casually.

## Current Email/Contact Issue

Root cause:

The source and local `frontend/web/dist` contained `info@2marines.us`, but `shieldmate.2marines.us` still showed `hello@2marines.us` because `shieldmate.2marines.us` is served by Hosting target `shieldmate` / site `2m-shieldmate-48cad`, while the deploy command updated Hosting target `marines-ai-agent`.

Rule:

Always deploy the Hosting target that matches the custom domain being tested.

## Rollback Guidance

If a target-specific Hosting deploy changes the wrong surface or breaks routing, roll back only the affected Hosting site in Firebase Console release history:

- Main site rollback: `marines-ai-agent`
- ShieldMate rollback: `2m-shieldmate-48cad`
- MarineCoin rollback: `marinecoin-2marines`

Do not change DNS during a Hosting rollback.
