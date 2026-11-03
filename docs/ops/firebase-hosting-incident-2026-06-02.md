# Firebase Hosting Incident - 2026-06-02

## Summary

On 2026-06-02, a live Firebase Hosting-only deploy for the Shopify `/shop` and `/store` redirect fix caused `https://2marines.us` to serve the ShieldMate/TIE React app bundle instead of the expected 2 Marines public hub.

The Shopify route redirects worked, DNS was not changed, and no functions, rules, storage, or MCP services were deployed. The failure was a whole-site hosting artifact regression: `firebase.json` pointed the `marines-ai-agent` Hosting target at `frontend/web/dist` instead of the prior `public` directory.

## Timeline

- Social and store URL registry alignment was committed in `581c34c`.
- `/shop` and `/store` route redirect behavior was committed in `f1e60ba`.
- Firebase Hosting target/public configuration was committed in `7188545`.
- Preview QA confirmed status-code behavior for `/store`, `/shop`, `/`, and `/shieldmate`.
- Live Hosting-only deploy was run against the `marines-ai-agent` Hosting target.
- Live QA found Shopify redirects working, but the public root rendered the ShieldMate/TIE React app instead of the prior 2 Marines public hub.
- Recovery direction was changed to Firebase Console rollback first, then repo config repair and artifact confirmation before any future live deploy.
- Firebase Console rollback was completed for Hosting site `marines-ai-agent` from release `162edb` to release `d0d363`.
- Joshua visually confirmed the restored public URLs: `https://www.2marines.us`, `https://2marines.us`, `https://www.2marines.us/shieldmate`, `https://shieldmate.2marines.us`, and `https://marinecoin.2marines.us`.

## Commits Involved

| Commit | Purpose | Incident relevance |
| --- | --- | --- |
| `581c34c` | Social/store registry alignment | Registry source for final Shopify and social URLs. |
| `f1e60ba` | `/shop` and `/store` Shopify redirect route fix | Redirects worked as intended. |
| `7188545` | Firebase Hosting target/public change | Changed Hosting `public` from `public` to `frontend/web/dist`, causing the full-site regression. |

## Root Cause

The root cause was the `firebase.json` Hosting public directory change:

```json
"public": "frontend/web/dist"
```

That value deployed the React app build as the live `2marines.us` site. The recovery repair restores:

```json
"public": "public"
```

The Hosting target remains `marines-ai-agent`, and the `/shop` and `/store` redirects remain route-level Shopify handoffs.

## Impact

- `https://2marines.us/store` redirected to `https://shieldmateapp.myshopify.com/`.
- `https://2marines.us/shop` redirected to `https://shieldmateapp.myshopify.com/`.
- `https://2marines.us` no longer visually matched the expected 2 Marines public hub after the live deploy.
- `https://2marines.us/shieldmate` loaded from the deployed React app bundle rather than being validated against the prior public-hub experience.

## What Worked

- `/shop` redirected to Shopify.
- `/store` redirected to Shopify.
- DNS was not changed or deleted.
- The live deploy was Hosting-only and target-specific.
- No functions, Firestore rules, storage rules, or MCP services were deployed.

## What Failed

- Preview QA checked status codes but did not validate visual identity against the prior 2 Marines public hub.
- The clean deploy worktree still carried a deployable config that pointed the public site at `frontend/web/dist`.
- The expected public hub artifact was not confirmed before live deploy.

## Public Hub Caveat

Repo `public/index.html` currently appears to be the default Firebase Hosting setup page and is not proven to be the real production 2 Marines public hub artifact.

Therefore, restoring `firebase.json` to `public` prevents redeploying `frontend/web/dist`, but it does not make the repo deploy-ready until the intended public hub artifact is confirmed.

## Rollback Confirmation

Firebase Console rollback is complete:

- `ROLLBACK_SITE=marines-ai-agent`
- `ROLLBACK_FROM=162edb`
- `ROLLBACK_TO=d0d363`
- `ROLLBACK_DONE=YES`

Joshua visually confirmed all five public URLs restored after rollback:

- `https://www.2marines.us`
- `https://2marines.us`
- `https://www.2marines.us/shieldmate`
- `https://shieldmate.2marines.us`
- `https://marinecoin.2marines.us`

This rollback confirms live recovery only. It does not prove repo `public/index.html` is the true 2 Marines public hub artifact, and no deploy should occur until that artifact is identified and previewed.

## Live Recovery Rule

Use Firebase Console rollback first:

Firebase Console -> Hosting -> `marines-ai-agent` -> Release history -> rollback to the previous known-good release.

Do not change DNS as part of this recovery.

## Repo Recovery Rule

Do not deploy again until the correct public hub artifact is confirmed.

The local repo repair should only:

- Keep Hosting target `marines-ai-agent`.
- Restore Hosting public directory to `public`.
- Keep `/shop` and `/store` as route-level redirects to Shopify.
- Document the unconfirmed public hub artifact.

## Commands Used During Incident

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm --prefix frontend/web run check
npm --prefix frontend/web run build
firebase hosting:channel:deploy shopify-route-qa --only hosting:marines-ai-agent --project marines-ai-agent
firebase deploy --only hosting:marines-ai-agent --project marines-ai-agent
```

The live deploy command was Hosting-only and target-specific, but the configured public directory was wrong for the public hub.

## STOP LIST

- Do not run `firebase deploy`.
- Do not run broad Firebase deploys without `--only hosting:<target>`.
- Do not deploy from dirty `D:\2marines\Shieldmate`.
- Do not deploy from `D:\2marines\Shieldmate-deploy-qa` unless it is clean and points to an approved commit.
- Do not deploy `frontend/web/dist` as the `2marines.us` public hub unless the explicit approved task is full public-hub replacement.
- Do not deploy functions, Firestore rules, storage rules, or MCP services.
- Do not change DNS.
- Do not push or commit recovery work until reviewed.
- Do not loosen claims, RBAC, App Check, gateway validation, or frontend auth behavior.

## Future Prevention Checklist

- Run Git branch, identity, status, diff, and HEAD checks before deploy.
- Deploy only from `D:\2marines\Shieldmate-deploy-qa`.
- Confirm clean deploy worktree before preview and live deploy.
- Confirm Firebase account is `2marines@2marines.us`.
- Confirm project is `marines-ai-agent`.
- Confirm Hosting target is `marines-ai-agent`.
- Confirm `firebase.json` public directory matches the intended artifact.
- Confirm the public hub artifact is the production 2 Marines hub.
- Run preview deploy first.
- QA `/`, `/shieldmate`, `/shop`, and `/store` in a browser.
- Verify visual identity, navbar labels, footer labels, and route behavior.
- Live deploy only after visual QA confirms the public hub has not been replaced.
