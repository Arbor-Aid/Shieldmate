# ShieldMate Admin Runbook (v1)

Audience: Internal admins (non-developers). Follow steps exactly; no code changes required.

## Roles and Limits
- `super_admin`: Full control; can issue/revoke roles and create orgs.
- `org_admin`: Manages own organization and its members; cannot self-promote to super_admin.
- `staff`: Org-scoped contributor; read/update within their org.
- `client`: End-user; access limited to own data.

## Assign Roles (setUserClaims)
1) Ensure you are signed in as `super_admin`.
2) Call the callable `setUserClaims` with data:
   - `uid`: target user UID
   - `roles`: optional global roles array (e.g., `["client"]`)
   - `orgRoles`: map of org â†’ roles (e.g., `{ "org_123": ["org_admin"] }`)
3) Force the user to refresh token (sign out/in or `getIdToken(true)`).
4) Verify claims (see â€œVerifyâ€ below). Unauthorized callers receive `permission-denied`.

## Onboard a New Organization
1) Create org doc (via admin tooling or console) with `name`, `status=active`.
2) Assign an `org_admin` via `setUserClaims` with `orgRoles` for that org.
3) Add membership document under `organizations/{orgId}/members/{uid}` with roles `["org_admin"]`.
4) Org admin can now invite staff/clients.

## Invite Staff vs Clients
- Use the invite flow (UI or Firestore) to create `invites` with `orgId`, `invitedEmail`, `roles`.
- Staff: roles typically `["staff"]` (or `["org_admin"]` for backup admins).
- Clients: roles `["client"]`.
- Invites expire via `expiresAt`; pending users have no org access until accepted.

## Revoke Access
1) Use `setUserClaims` to remove roles (send empty arrays).
2) Remove org membership doc (`organizations/{orgId}/members/{uid}`).
3) (Optional) Mark user/org status as suspended in Firestore if needed.

## Verify Claims + Firestore Enforcement
1) After issuing claims, have the user refresh token.
2) Check custom claims for `roles` and `orgRoles`.
3) Test access: org_admin can manage only their org; attempts to access another org should be denied by Firestore rules.

## Audit Logs
- Location: `audits` collection in Firestore (append-only).
- Look for actions: `set_user_claims`, `invite_created/accepted/declined`, MCP call audits, errors.
- Ensure no PII is stored in audits.

## Basic Incident Response
- Auth failure: Re-authenticate; confirm App Check and claims; check `audits` for errors.
- Access denial: Verify claims/orgRoles; confirm membership doc; ensure token refresh.
- MCP error: Check MCP audit entries; verify ID token and App Check are sent; retry; escalate if persistent.

## Key Safety Notes
- Only `super_admin` may issue roles via `setUserClaims`.
- No self-escalation: caller UID cannot assign roles to itself.
- Org data is isolated; cross-org access must be denied by rules.

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

## Emergency: 2marines.us Visual Regression After Hosting Deploy

Use this when `2marines.us` visually changes after a Firebase Hosting deploy.

1. Stop deploys immediately.
2. Do not change DNS.
3. Do not push, stage, commit, reset, clean, or redeploy while live state is being assessed.
4. Roll back Firebase Hosting first: Firebase Console -> Hosting -> `marines-ai-agent` -> Release history -> rollback previous known-good release.
5. Verify `https://2marines.us/` visually matches the expected 2 Marines public hub.
6. Verify `https://2marines.us/shieldmate` loads the expected ShieldMate page.
7. Verify `https://2marines.us/shop` redirects to `https://shieldmateapp.myshopify.com/`.
8. Verify `https://2marines.us/store` redirects to `https://shieldmateapp.myshopify.com/`.
9. Document the incident in `docs/ops/firebase-hosting-incident-2026-06-02.md`.
10. Confirm the intended public hub artifact before any new live deploy.
11. Repair repo config only after live rollback is complete or explicitly confirmed.

Do not deploy functions, Firestore rules, storage rules, MCP services, claims, RBAC, App Check, gateway validation, or frontend auth changes as part of this recovery.

2026-06-02 confirmed recovery:
- Firebase Console rollback for Hosting site `marines-ai-agent` completed from release `162edb` to release `d0d363`.
- Joshua visually confirmed `https://www.2marines.us`, `https://2marines.us`, `https://www.2marines.us/shieldmate`, `https://shieldmate.2marines.us`, and `https://marinecoin.2marines.us` restored.
- Repo `public/index.html` is not yet proven to be the true 2 Marines public hub artifact.
- Do not deploy again until the true public hub artifact is identified and previewed.

