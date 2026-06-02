# Firebase Hosting Runbook

## Authority

- Firebase account: `2marines@2marines.us`
- Firebase project: `marines-ai-agent`
- Hosting site: `marines-ai-agent`
- Hosting target: `marines-ai-agent`
- Clean deploy worktree: `D:\2marines\Shieldmate-deploy-qa`

## 2026-06-02 Rollback Confirmation

Firebase Console rollback was completed successfully for Hosting site `marines-ai-agent`.

- Rolled back from release `162edb`.
- Rolled back to release `d0d363`.
- Joshua visually confirmed `https://www.2marines.us`, `https://2marines.us`, `https://www.2marines.us/shieldmate`, `https://shieldmate.2marines.us`, and `https://marinecoin.2marines.us` were restored.

This confirms the live site was recovered. It does not prove repo `public/index.html` is the true 2 Marines public hub artifact. Do not deploy again until the correct public hub artifact is identified and previewed.

## Clean Worktree Policy

Deploys must use the clean worktree at `D:\2marines\Shieldmate-deploy-qa`.

Never deploy from `D:\2marines\Shieldmate` if it is dirty. That repo is the active working tree and may contain unrelated docs, Shopify, onboarding, installer, or runtime changes.

Before deploy, confirm:

```powershell
git status --short
git log -1 --format="%h %an <%ae> %s"
firebase login:list
firebase use
firebase hosting:sites:list --project marines-ai-agent
```

Stop unless the worktree is clean, the approved commit is checked out, Firebase is logged in as `2marines@2marines.us`, and the active project is `marines-ai-agent`.

## Deploy Target Rule

Hosting deploys must be Hosting-only and target-specific.

Allowed pattern:

```powershell
firebase deploy --only hosting:marines-ai-agent --project marines-ai-agent
```

Do not run plain `firebase deploy`.

Do not deploy:

- Cloud Functions
- Firestore rules
- Storage rules
- MCP services
- Gateway validation
- Claims/RBAC/App Check changes

## Hosting Terms

| Term | Meaning |
| --- | --- |
| DNS | Domain routing outside the repo. DNS should not be changed for Shopify route recovery. |
| Firebase Hosting target | Local deploy target name mapped to a Firebase Hosting site. For `2marines.us`, this is `marines-ai-agent`. |
| Firebase Hosting public directory | The local directory Firebase uploads as static Hosting content. It must match the intended artifact. |
| `frontend/web/dist` app build | React app build output. Do not deploy it as the `2marines.us` public hub unless explicitly approved as a full public-hub replacement. |
| Public hub artifact | The intended production 2 Marines public hub files. Repo `public/index.html` is not accepted as production hub until proven. |
| Route-level redirect | A narrow Hosting or frontend redirect for a route such as `/shop` or `/store`, not a full-site content replacement. |

## Visual QA Checklist

Preview QA must validate behavior and visual identity:

- `/` visually matches the expected 2 Marines public hub.
- `/shieldmate` loads the expected ShieldMate page.
- `/shop` redirects to `https://shieldmateapp.myshopify.com/`.
- `/store` redirects to `https://shieldmateapp.myshopify.com/`.
- Navbar labels match the expected public hub.
- Footer labels match the expected public hub.
- Shopify storefront opens correctly from the redirect routes.

Status-code checks are not sufficient by themselves.

## Rollback Steps

Use Firebase Console rollback before repo redeploy during a live visual regression:

1. Open Firebase Console.
2. Select project `marines-ai-agent`.
3. Open Hosting.
4. Select Hosting site `marines-ai-agent`.
5. Open Release history.
6. Roll back to the previous known-good release.
7. Verify `https://www.2marines.us`, `https://2marines.us`, `https://www.2marines.us/shieldmate`, `https://shieldmate.2marines.us`, and `https://marinecoin.2marines.us`.
8. Separately verify `/shop` and `/store` route-level Shopify redirects if they are part of the approved release scope.

Do not change DNS during this rollback.

## Public Hub Artifact Rule

`public/index.html` is not accepted as the production 2 Marines public hub until proven.

The repo is not deploy-ready for another live Hosting deploy until the intended public hub artifact is confirmed and preview QA verifies it visually.

## Recovery Gate

Before any new live deploy:

- Confirm the approved commit.
- Confirm the clean deploy worktree.
- Confirm `firebase.json` target is `marines-ai-agent`.
- Confirm `firebase.json` public directory points to the approved public hub artifact.
- Confirm `/shop` and `/store` remain route-level Shopify redirects.
- Confirm no functions, rules, storage, MCP, claims, RBAC, App Check, gateway, or frontend auth changes are included.
- Complete preview deploy and visual QA.
