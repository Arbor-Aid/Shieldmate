# Marine Coins Deployment Checklist

Date: 2026-06-03

This checklist separates Marine Coins deployment readiness from the 2Marines
public hub and ShieldMate deployment lanes. Customer-facing copy should use
Marine Coins where possible; existing technical routes and build keys may keep
the `marinecoin` convention.

## Deployment Lane

- Firebase project: `marines-ai-agent`
- Hosting target: `marinecoin`
- Hosting site from `.firebaserc`: `marinecoin-2marines`
- Build script: `npm --prefix frontend/web run build:marinecoin`
- Build output: `frontend/web/dist`
- Public URL to verify: `https://marinecoin.2marines.us`
- In-app route family: `/marinecoin`

## Pre-Deploy Checks

1. Confirm a human has approved a Marine Coins deployment window.
2. Confirm no 2Marines public hub recovery work is mixed into this deployment.
3. Confirm `firebase.json` has a hosting config for target `marinecoin` before deploying this target.
4. Confirm the build command is `npm --prefix frontend/web run build:marinecoin`.
5. Confirm `frontend/web/dist` renders the standalone MarineCoin landing experience for the Marine Coins host.
6. Confirm legal pages exist and route correctly:
   - `/marinecoin/legal/privacy`
   - `/marinecoin/legal/terms`
   - `/marinecoin/legal/disclaimer`
7. Confirm contact copy uses `info@2marines.us`.
8. Confirm customer-facing copy does not describe MarineCoin as a cryptocurrency, security, investment, or promise of profit.
9. Confirm `VITE_MARINE_COINS_URL` and `VITE_MARINE_COINS_SUBDOMAIN_URL` are correct if overridden in the deployment environment.
10. Confirm social links still match `docs/marketing/marketing-links-registry.md`.

## Verification Commands

Run locally only before any deploy:

```powershell
npm --prefix frontend/web run typecheck
npm --prefix frontend/web run build:marinecoin
```

Optional preview:

```powershell
npm --prefix frontend/web run preview
```

## Deploy Command

Do not run until explicitly approved:

```powershell
firebase deploy --only hosting:marinecoin --project marines-ai-agent
```

## Post-Deploy Checks

1. Open `https://marinecoin.2marines.us`.
2. Verify the standalone MarineCoin landing page, not the 2Marines Public Hub or ShieldMate landing page.
3. Verify `/marinecoin`, `/marinecoin/waitlist`, and legal routes.
4. Verify no `/shop` or `/store` behavior changed on `2marines.us`.
5. Record the Firebase Hosting release ID and screenshots in the release notes.

## Rollback

If the Marine Coins deploy changes the wrong surface or breaks routing, roll back
only the `marinecoin-2marines` hosting site from Firebase Hosting release
history. Do not roll back `marines-ai-agent` or `2m-shieldmate-48cad` unless the
incident explicitly affects those sites.
