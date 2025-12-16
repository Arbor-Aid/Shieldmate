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
   - `orgRoles`: map of org → roles (e.g., `{ "org_123": ["org_admin"] }`)
3) Force the user to refresh token (sign out/in or `getIdToken(true)`).
4) Verify claims (see “Verify” below). Unauthorized callers receive `permission-denied`.

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
