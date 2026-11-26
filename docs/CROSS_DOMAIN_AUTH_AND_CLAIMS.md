# Cross-Domain Auth and Claims

Audit date: 2026-06-03

This document defines the intended cross-domain Firebase Auth and claims behavior for the 2Marines ecosystem. It does not change Firebase Auth settings, custom claims, Firestore rules, Storage rules, or app code.

## Shared Firebase Auth Domains

All ecosystem web surfaces should share Firebase project `marines-ai-agent` and Firebase Auth.

| Surface | Domain or fallback | Auth sharing intent |
| --- | --- | --- |
| 2Marines main site | `2marines.us`, `www.2marines.us` | Public pages plus protected app routes use the shared Auth project. |
| ShieldMate | `shieldmate.2marines.us` | Authenticated app/admin workflows use the shared Auth project. |
| MarineCoin | `marinecoin.2marines.us` | Public by default; protected waitlist/app flows should use the shared Auth project if enabled. |
| Main web.app fallback | `marines-ai-agent.web.app` | Same app/project fallback for main target. |
| ShieldMate web.app fallback | `2m-shieldmate-48cad.web.app` | Same app/project fallback for ShieldMate target. |
| MarineCoin web.app fallback | `marinecoin-2marines.web.app` | Same app/project fallback for MarineCoin target. |
| Firebase Auth domain | `marines-ai-agent.firebaseapp.com` | Default Firebase Auth domain from frontend config. |

## Firebase Auth Authorized Domains

These domains should be present in Firebase Auth authorized domains before relying on login flows:

- `2marines.us`
- `www.2marines.us`
- `shieldmate.2marines.us`
- `marinecoin.2marines.us`
- `marines-ai-agent.web.app`
- `2m-shieldmate-48cad.web.app`
- `marinecoin-2marines.web.app`
- `marines-ai-agent.firebaseapp.com`
- `localhost` for local development only, if needed

Do not add broad wildcard domains unless Firebase explicitly supports and requires them for this project.

## Claims Shape

Canonical claim fields:

```ts
type CustomClaims = {
  roles?: string[];
  orgRoles?: Record<string, string[]>;
  orgId?: string;
  role?: string;
  org?: string;
};
```

`roles`, `orgRoles`, and `orgId` should be treated as canonical. Legacy `role` and `org` are accepted only where existing compatibility code already supports them.

## Ecosystem Roles

| Role/claim | Scope | Intended meaning |
| --- | --- | --- |
| `super_admin` | Global | Global override for admin and org workflows. |
| `admin` | Global or legacy UI role | Administrative app access, but not a `super_admin` substitute. |
| `org_admin` | Org scoped | Manage org records, members, and approvals for assigned orgs. |
| `staff` | Org scoped | Read/use org workflows for assigned orgs. |
| `organization` | Legacy UI role | Compatibility role satisfied by `org_admin` or `staff`. |
| `client` | User scoped | Client/user app access to own workflows. |

Additional existing note: `case_worker` appears in the MCP gateway allow-list. It is not part of the requested ecosystem role list and should be explicitly reconciled before new route behavior depends on it.

## Intended Hierarchy

| Rule | Confirmed intent |
| --- | --- |
| `super_admin` satisfies `admin` | Yes. Existing frontend compatibility helper supports this. |
| `admin` satisfies `super_admin` | No. Admin is not the global override. |
| `org_admin` satisfies `organization` | Yes, for legacy route compatibility. |
| `staff` satisfies `organization` | Yes, for legacy route compatibility. |
| `organization` satisfies `org_admin`/`staff` | Existing frontend helper preserves this legacy compatibility; do not add new direct comparisons outside adapters. |
| Legacy `role`/`org` behavior | Preserve only where already existing. New privileged code should prefer `roles`, `orgRoles`, and `orgId`. |

## Route Requirements

| Route family | Requirement |
| --- | --- |
| `/`, `/programs`, `/partners`, `/contact`, `/info`, `/shieldmate`, `/features`, `/pricing`, `/about`, `/marinecoin*`, `/shop`, `/store`, `/signin`, `/signup`, `/login` | Public route or public redirect unless the page itself starts an authenticated flow. |
| `/client` | Authenticated user. Existing top-level route does not enforce a role wrapper. |
| `/organization`, `/org`, `/org/admin` | Authenticated user. Existing top-level route does not enforce a role wrapper. |
| `/admin` | Authenticated user. Page-level checks may apply for specific actions. |
| `/admin/rbac` | `super_admin`. |
| `/admin/approvals`, `/admin/approvals/new` | Authenticated route plus page-level `super_admin` or org-scoped `org_admin`. |
| `/app` | Authenticated user. |
| `/app/user*` | `client`. |
| `/app/org*` | `organization`, `org_admin`, or `staff`. |
| `/app/admin*` | `admin` or `super_admin`. |
| `/app/admin/mcp-health` | `admin` or `super_admin`; calls MCP health only. |
| `/analytics`, `/profile`, `/conversations` | Authenticated user. Tighten by route-specific policy if sensitive data expands. |
| `/questionnaire` | Currently public in the route table; review before collecting sensitive user data. |

## MCP Role Requirements

| MCP action class | Required role/claim | Approval required? |
| --- | --- | --- |
| Public health/meta/version | None at route level | No |
| Protected gateway execute/context/tool routes | Firebase ID token plus one of gateway allowed roles | Depends on action |
| Org-scoped protected action | Valid org claim matching requested org | Depends on action |
| Google Ads draft creation | `super_admin` or org-scoped `org_admin` | Draft creation is not external execution, but audit record is required |
| Google Ads execution | `super_admin` or org-scoped `org_admin` plus approved record | Yes |
| Content draft generation | Authenticated role appropriate to org/content scope | No external publish without approval |
| Metrics/health/policy reads | Authenticated role appropriate to data scope | No, unless sensitive export is involved |
| Claims/role mutation | `super_admin` through approved admin path | Yes |

## Actions Requiring Explicit Approval

These require a human approval record even for authorized users:

- Publish social content.
- Spend ad money.
- Create, update, pause, or delete Google Ads campaigns.
- Update Shopify products, orders, checkout, pricing, fulfillment, or Admin settings.
- Deploy Hosting, Functions, Firestore rules, Storage rules, MCP gateway, or MCP services.
- Change user roles, custom claims, org memberships, or privileged account access.
- Access, export, or bulk-download sensitive user/org/audit data.
- Submit, release, or mutate App Store Connect or Google Play records.
- Change API credentials, OAuth apps, billing, or account permissions.

## Verification

Manual checks:

- Log in and out on each custom domain and web.app fallback.
- Confirm token refresh or re-login is required after claim changes.
- Verify public routes remain public and protected routes redirect or deny.
- Verify `super_admin` can access admin routes and `admin` cannot access `super_admin`-only routes.
- Verify org-scoped users cannot access another org by changing an `orgId`.
- Verify MCP protected endpoints fail closed without auth.
