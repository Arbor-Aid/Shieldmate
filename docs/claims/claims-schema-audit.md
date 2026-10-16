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

`roles`, `orgRoles`, and `orgId` are the canonical fields. `role` and `org` are compatibility fields still written by the admin paths and accepted by rules/gateway/frontend.

## Usage Inventory

| Area | File paths and symbols | Schema behavior | Result |
| --- | --- | --- | --- |
| Firestore rules | `firestore.rules`: `hasGlobalRole`, `hasOrgRole` | Reads canonical `roles`, `orgRoles`, `orgId` and legacy `role`, `org`. Requires App Check for protected reads/writes and denies by default. | Aligned; do not loosen. |
| Callable/admin claims writer | `backend/firebase/functions/index.ts`: `setUserClaims`; `backend/firebase/rbac-admin.ts`: `assignCustomClaims` | Validates allowed roles, writes `roles`, `orgRoles`, resolved `orgId`, and legacy `role`/`org`. Prevents self-escalation in callable path. | Canonical source. |
| Root Firebase functions | `functions/index.js` | Current root functions file is not a claims writer. | No schema action. |
| Active MCP gateway | `mcp/mcp-gateway/src/auth/verifyFirebaseToken.ts`; `requireRole.ts`; `requireOrg.ts` | Normalizes `roles`, `orgRoles`, `orgId`, `role`, and `org`; `requireRole` accepts merged role set; `requireOrg` fails closed on missing org. | Aligned for production tokens. |
| Active MCP common Python auth | `mcp/common/auth.py`: `verify_firebase_token`, `_extract_org_id`, `_extract_roles`, `enforce_org_match`, `require_approver` | Extracts canonical and legacy org/role fields. Dev noauth returns `roles: ["super_admin"]` plus `admin: True`; `require_approver` still accepts `admin` bool. | Mostly aligned; `admin` bool is compatibility/dev-only risk to remove later. |
| Root gateway placeholders | `gateway/auth/verifyFirebaseToken.ts`; `requireRole.ts`; `requireOrg.ts` | Placeholder verifier throws; types and guards only model `role` and `org`. | Divergent and likely inactive placeholder. Do not use for production. |
| React frontend | `frontend/web/src/services/roleService.ts`: `getRoleClaims`, `resolveEffectiveRole`; `frontend/web/src/components/RoleCheck.tsx` | Reads `roles`, `orgRoles`, `orgId`, legacy `role`/`org`; maps `super_admin` to legacy UI `admin`, and `org_admin`/`staff` to legacy UI `organization`. | Aligned with compatibility mapping. |
| React RBAC admin client | `frontend/web/src/services/rbacAdminClient.ts` | Sends `uid`, `roles`, and `orgRoles` to callable. | Aligned. |
| Flutter frontend | `frontend/flutter/lib/core/utils/user_profile.dart`; `frontend/flutter/lib/core/utils/user_profile_service.dart` | Reads `roles`, `orgRoles`, and legacy `role`; maps canonical roles to `AppRole.admin`, `AppRole.partner`, or `AppRole.client`. | Aligned for read-side compatibility. |
| Tests/fixtures | `frontend/web/src/hooks/__tests__/useMcpClient.test.tsx`; `frontend/flutter/test` | No dedicated claims schema fixtures found. | Add focused schema fixtures when behavior changes. |

## Divergent Schema Findings

| Finding | Evidence | Risk | Proposed minimal alignment diff |
| --- | --- | --- | --- |
| `docs/FIRESTORE_SCHEMA.md` omits `case_worker`, `orgId`, and legacy `role`/`org` compatibility from its claims summary. | `docs/FIRESTORE_SCHEMA.md`; `backend/firebase/functions/index.ts`; `backend/firebase/rbac-admin.ts` | Documentation drift can cause future writers to omit fields that rules/frontend expect. | Update the schema doc to include allowed `case_worker`, canonical `orgId`, and temporary legacy bridge fields. |
| Root gateway auth placeholders only know `role`/`org`. | `gateway/auth/verifyFirebaseToken.ts`; `gateway/auth/requireRole.ts`; `gateway/auth/requireOrg.ts` | If this placeholder layer is wired into production later, canonical `roles`/`orgRoles` could fail authorization. | Either park this root gateway as inactive or align its types/guards with `mcp/mcp-gateway/src/auth/*` before use. |
| Python MCP common still treats `admin` bool as approver authority. | `mcp/common/auth.py`: `require_approver` | A noncanonical field could become an accidental bypass if production tokens ever include it. | Remove `admin` bool from production approver checks after confirming no deployed service relies on it; keep dev bypass controlled by `ALLOW_DEV_NOAUTH=true`. |
| Web and Flutter UI still expose legacy role names. | `frontend/web/src/services/roleService.ts`; `frontend/web/src/components/RoleCheck.tsx`; `frontend/flutter/lib/core/utils/user_profile.dart` | UI naming can obscure canonical roles and lead to role comparisons outside the compatibility layer. | Keep mapping centralized; do not add new direct comparisons to `admin`/`organization` outside existing adapters. |

## Guardrails

- Do not loosen `firestore.rules` to compensate for schema mismatch.
- New privileged endpoints should consume `roles`, `orgRoles`, and `orgId` first, then compatibility fields only where explicitly documented.
- Claim changes require token refresh; stale tokens should fail closed.
- `super_admin` remains the only global override.
