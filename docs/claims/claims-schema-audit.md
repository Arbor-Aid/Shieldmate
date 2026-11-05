# Claims Schema Audit

Audit date: 2026-06-01

## Canonical Schema Source

Canonical custom claims are defined by the callable/admin writers and enforced by Firestore rules:

- `backend/firebase/functions/index.ts`: `setUserClaims`, `Role`, `SetUserClaimsInput`, `normalizeClaimRoles`, `resolveClaimOrgId`.
- `backend/firebase/rbac-admin.ts`: `assignCustomClaims`, `Role`, `OrgRoleClaims`.
- `firestore.rules`: `hasGlobalRole`, `hasOrgRole`, `isSuperAdmin`, `canManageOrg`, `canReadOrg`, `canManageApprovals`.
- `docs/FIRESTORE_SCHEMA.md`: claims model summary.

Canonical shape:

```ts
type Role = "super_admin" | "org_admin" | "staff" | "case_worker" | "client";

type CustomClaims = {
  roles: Role[];
  orgRoles: Record<string, Role[]>;
  orgId?: string;
  role?: Role;
  org?: string;
};
```

`roles`, `orgRoles`, and `orgId` are the canonical fields. `role` and `org` are organization-scoped compatibility fields. Only `super_admin` in canonical `roles` grants global authority.

## Usage Inventory

| Area | File paths and symbols | Schema behavior | Result |
| --- | --- | --- | --- |
| Firestore rules | `firestore.rules`: `hasGlobalRole`, `hasOrgRole` | Uses canonical `roles` for global authority; legacy `role`/`org` is accepted only for matching organization scope. Requires App Check and denies by default. Approval decisions have restricted mutable fields. | Aligned; do not loosen. |
| Callable/admin claims writer | `backend/firebase/functions/index.ts` and runtime `index.js`: `setUserClaims`; `backend/firebase/rbac-admin.ts`: `assignCustomClaims` | Callable requires canonical global `super_admin`, rejects self-escalation, validates role shape and organization existence, and rejects nested `super_admin`. | Canonical tracked implementation. |
| Firebase deployment entrypoints | Root `firebase.json` and `backend/firebase/firebase.json` | The root full-stack config and nested functions-only config both resolve to `backend/firebase/functions`. Its ESM package executes `index.js`, which exports the hardened `setUserClaims` handler and imports `claims-policy.js`. `index.ts` is maintained source/reference but is not compiled by the deployment package. | Canonical local deployment path aligned; live artifact revision still requires deployment evidence. |
| Active MCP gateway | `mcp/mcp-gateway/src/auth/verifyFirebaseToken.ts`; `requireRole.ts`; `requireOrg.ts` | Normalizes `roles`, `orgRoles`, `orgId`, `role`, and `org`; `requireRole` accepts merged role set; `requireOrg` fails closed on missing org. | Aligned for production tokens. |
| Active MCP common Python auth | `mcp/common/auth.py`: `verify_firebase_token`, `_extract_org_id`, `_extract_roles`, `enforce_org_match`, `require_approver` | Enforces org scope, ignores `admin: true`, and refuses the explicit development-token bypass in production/Cloud Run environments. | Aligned. |
| Root gateway placeholders | `gateway/auth/verifyFirebaseToken.ts`; `requireRole.ts`; `requireOrg.ts` | Placeholder verifier throws; types and guards only model `role` and `org`. | Divergent and likely inactive placeholder. Do not use for production. |
| React frontend | `frontend/web/src/services/roleService.ts`: `getRoleClaims`, `resolveEffectiveRole`; `frontend/web/src/components/RoleCheck.tsx` | Preserves canonical org roles; canonical org roles satisfy generic organization UI, but legacy `organization` cannot satisfy a specific privileged role and scoped legacy `admin` cannot grant global admin UI. | Aligned with fail-closed compatibility mapping. |
| React RBAC admin client | `frontend/web/src/services/rbacAdminClient.ts` | Sends `uid`, `roles`, and `orgRoles` to callable. | Aligned. |
| Flutter frontend | `frontend/flutter/lib/core/utils/user_profile.dart`; `frontend/flutter/lib/core/utils/user_profile_service.dart` | Verified canonical `roles: ["super_admin"]` drives admin UI. Scoped legacy `admin` is partner presentation; user profile role strings cannot grant administrative app role. | Aligned for read-side compatibility. |
| Tests/fixtures | Gateway, MCP common, web role-service, Flutter role resolver, and callable policy tests | Covers global/scoped authority, cross-org rejection, legacy inputs, nested `super_admin`, admin booleans, ambiguous orgs, and self-escalation policy. | Focused regression coverage added. |

## Divergent Schema Findings

| Finding | Evidence | Risk | Proposed minimal alignment diff |
| --- | --- | --- | --- |
| Root gateway auth placeholders only know `role`/`org`. | `gateway/auth/verifyFirebaseToken.ts`; `gateway/auth/requireRole.ts`; `gateway/auth/requireOrg.ts` | If this placeholder layer is wired into production later, canonical `roles`/`orgRoles` could fail authorization. | Either park this root gateway as inactive or align its types/guards with `mcp/mcp-gateway/src/auth/*` before use. |
| Web and Flutter UI still expose legacy role names. | `frontend/web/src/services/roleService.ts`; `frontend/web/src/components/RoleCheck.tsx`; `frontend/flutter/lib/core/utils/user_profile.dart` | UI naming can obscure canonical roles and lead to role comparisons outside the compatibility layer. | Keep mapping centralized; do not add new direct comparisons to `admin`/`organization` outside existing adapters. |

## Guardrails

- Do not loosen `firestore.rules` to compensate for schema mismatch.
- New privileged endpoints should consume `roles`, `orgRoles`, and `orgId` first, then compatibility fields only where explicitly documented.
- Claim changes require token refresh; stale tokens should fail closed.
- `super_admin` remains the only global override.
