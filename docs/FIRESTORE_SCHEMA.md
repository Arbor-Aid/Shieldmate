## Firestore Schema (Authoritative)

- `organizations/{orgId}`
  - fields: `name`, `domain?`, `status`, `createdAt`, `updatedAt`
  - access: super_admin; org_admin/staff (read), org_admin (write)

- `organizations/{orgId}/members/{uid}`
  - fields: `uid`, `orgId`, `roles[]`, `status`, timestamps
  - access: user reads own; org_admin/super_admin manage; staff read

- `users/{uid}`
  - profile only; self read/write; super_admin read

- `audits/{auditId}`
  - append-only audit events: `uid`, `action`, `category`, `orgId?`, `resource?`, `timestamp`, `details?`
  - access: create self; read super_admin; no updates/deletes

- `invites/{inviteId}`
  - fields: `orgId`, `invitedEmail`, `invitedUid`, `roles[]`, `status`, `token`, `expiresAt`, `createdBy`
  - access: org_admin/super_admin create; invitee read/accept; expires enforced

- `conversations/{conversationId}`
  - fields: `uid`, conversation payload
  - access: owner read/write

## Indexes
- Collection group `members`: composite on `(orgId ASC, uid ASC)` for membership lookups.
- Invites typically queried by `invitedEmail` + `status` (single-field); composite indexes added only if a new multi-field query is introduced.

## Claims Model
- Custom claims:
  - `roles: string[]` supports `super_admin`, `org_admin`, `staff`, `case_worker`, `client`; only `super_admin` is global, while non-global roles require matching `orgId`
  - `orgRoles: { [orgId]: string[] }` for org-scoped roles
  - `orgId: string` selects the active organization scope
  - legacy `role` and `org` are accepted only as an organization-scoped compatibility pair and never grant global `super_admin`

## RBAC Summary
- super_admin: global manage/read
- org_admin: manage org + members
- staff: read org data
- client: own data only
