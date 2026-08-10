## Developer Operations (Optional Helpers)

- `npm run verify` / `npm run check` runs lint â†’ typecheck â†’ build.
- Pre-commit (optional): `npx husky-init && npm run prepare` then set hook to `npm run precommit` (script already defined). Skip if you prefer manual runs.
- Service worker + PWA are registered automatically; disable by commenting `registerServiceWorker()` in `src/main.tsx` if troubleshooting.

---

## 2026-04-13 Multi-Node Authority Snapshot

Updated: 2026-06-01 15:16:28

Authoritative repo root:
D:\2marines\Shieldmate

Authoritative branch:
ui-rebuild-flutter-gen-ui

System node roles:
- THE-BOT: primary Windows control, build, and backend node
- HONEY: Raspberry Pi Kali monitoring and security node
- LAPTOP: dev, control, and review node

Operating policy:
- Laptop and THE-BOT stay aligned to canon during bring-up
- MCP updates must land on canon before endpoint activation
- Claims and auth schema remain unified end-to-end
- Do not delete folders; park legacy only after confirmation
<!-- MSI_CANON_TRANSITION_START -->
## 2026-05-22 MSI Canon Transition

Active Windows development machine:
- MSI: active ShieldMate development workstation

Active MSI canon root:
D:\2marines\Shieldmate

Legacy / parked machine:
- Old Dell laptop: legacy/parked after MSI onboarding. Preserve historical state; do not delete legacy paths without explicit authority.

Operating policy:
- MSI is the active development node for Launch Validation Phase.
- MCP updates must land on canon before endpoint activation.
- MCP Gateway remains the RBAC ingress.
- Slack remains notification and intake only, never system of record.
- Firebase claims, RBAC, and App Check guardrails remain unchanged.
- Existing Shopify/shop work is preserved.
<!-- MSI_CANON_TRANSITION_END -->

---

## Firebase Hosting Deployment Safety Gate

Every Firebase Hosting deploy for `2marines.us` must pass this gate before preview and again before live deploy.

- Run a Git audit: branch, status, HEAD, cached diff, unstaged diff, and remote.
- Confirm Git identity is `Joshua McAllister <joshua.mcallister1987@gmail.com>`.
- Deploy only from the clean worktree `D:\2marines\Shieldmate-deploy-qa`.
- Do not deploy from dirty `D:\2marines\Shieldmate`.
- Do not run broad `firebase deploy`.
- Use Hosting-only, target-specific deploys such as `firebase deploy --only hosting:marines-ai-agent --project marines-ai-agent`.
- Do not deploy functions, Firestore rules, storage rules, MCP services, claims, RBAC, App Check, gateway validation, or frontend auth changes.
- Run a Firebase preview deploy before live deploy.
- Browser QA must visually confirm `/` is the expected 2 Marines public hub, `/shieldmate` is the expected ShieldMate page, and `/shop` and `/store` redirect to Shopify.
- Confirm the public hub artifact before live deploy. `public/index.html` is not accepted as production hub until proven.
- If a visual regression reaches live, use the Firebase Console rollback procedure in `docs/ops/firebase-hosting-runbook.md` before any repo redeploy.

2026-06-02 recovery status:
- Firebase Console rollback for Hosting site `marines-ai-agent` completed successfully from release `162edb` to release `d0d363`.
- Joshua visually confirmed `https://www.2marines.us`, `https://2marines.us`, `https://www.2marines.us/shieldmate`, `https://shieldmate.2marines.us`, and `https://marinecoin.2marines.us` restored.
- Repo `public/index.html` is still not proven to be the true 2 Marines public hub artifact.
- Do not deploy again until the true public hub artifact is identified and previewed.

