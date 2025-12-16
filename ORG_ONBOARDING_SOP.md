# Organization Onboarding SOP (v1)

Audience: Partner org admins.

## Org Creation Flow
1) Org is created by super_admin (name, status=active).
2) An org_admin is assigned to the org via `setUserClaims` (orgRoles).
3) Membership doc created under `organizations/{orgId}/members/{uid}` with roles.

## Invite Lifecycle
- Send: Org admin creates invite with `invitedEmail`, `orgId`, `roles`, `expiresAt`.
- Pending: Invitee can sign in but cannot access org data.
- Accept: Invitee accepts → roles applied and membership created.
- Decline/Expire: No access granted.

## First-Login Routing
- Pending invite → `/onboarding` (accept/decline).
- Member → `/org` dashboard.
- No org/invite → `/profile`.

## Common Failure Cases
- Invite expired: Reissue invite.
- Permission denied: Check claims/orgRoles and membership; ensure token refresh.
- Wrong org: Verify orgId in invite and membership.

## Org Admin Capabilities
- Can invite staff/clients within their org.
- Can manage membership for their org only.
- Cannot grant super_admin; cannot access other orgs.

## Security Expectations
- Keep invites targeted (email/UID) and time-bound.
- Use org-scoped roles (`org_admin`, `staff`, `client`); avoid broad global roles.
- Audit invites and membership changes regularly.***
