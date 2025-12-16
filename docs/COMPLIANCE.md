## SOC-lite Readiness

### Auth & RBAC
- Firebase Auth with custom claims.
- Roles: `super_admin`, `org_admin`, `staff`, `client`; org-scoped via `orgRoles`.
- Firestore rules enforce Auth + App Check + role gating; client role is read-only outside own data.

### Audit Logging
- `audits` collection is append-only; entries include actor, action, category, org, resource, timestamp, retentionDays.
- ErrorBoundary and MCP client log failures to audits (no PII).
- Retention metadata (default 365 days) stored per entry; optional cleanup function planned, not automated.

### Data Isolation
- Org data segmented under `organizations/{orgId}` with member subcollections; access requires org roles.
- Invites enforce matching email/uid and expiry; pending users have no org access until accepted.

### Access Reviews
- Access review records can be stored in `audits` (category `auth`) and `organizations/{orgId}/members` snapshots.
- Review cadence: monthly for org_admin/staff, quarterly for super_admin; approvals logged via audits.

### Incident Response (lightweight)
- Detect: monitor audit anomalies and MCP failures.
- Contain: revoke roles via callable `setUserClaims`; set org status to `suspended`.
- Recover: re-issue claims post-review; document in audits.

### Data Retention & PII
- No PII stored in audits; avoid logging secrets/tokens.
- Conversations and org documents remain org-scoped; service worker caches only shell assets.
