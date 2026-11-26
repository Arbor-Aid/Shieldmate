# MCP Ecosystem Alignment

Audit date: 2026-06-03

This audit documents MCP alignment only. No MCPs were deleted, renamed, deployed, or changed.

## Files Reviewed

- `docs/MCP_GATEWAY_ENDPOINTS.md`
- `docs/MCP_LAUNCH_VERIFICATION.md`
- `docs/MCP_ENV_VARS.md`
- `docs/MCP_SERVICE_LIST.md`
- `docs/mcp/mcp-fleet-audit.md`
- `docs/google-ads-approvals.md`
- `docs/agents/connection-day-agent-map.md`
- `mcp_services.csv`
- `mcp/mcp-gateway/src/mcp/registry.ts`
- `mcp/mcp-gateway/src/server.ts`
- `mcp/mcp-gateway/src/auth/verifyFirebaseToken.ts`
- `mcp/mcp-gateway/src/auth/requireRole.ts`
- `frontend/web/src/services/mcpClient.ts`
- `frontend/web/src/services/mcpGateway.ts`
- `frontend/web/src/services/approvalService.ts`
- `frontend/web/src/hooks/useMcpClient.ts`
- `frontend/web/src/pages/AdminApprovals.tsx`
- `.env.2marines`, `.env.shieldmate`, `.env.marinecoin`, `frontend/web/.env.2marines`

Paths named in the request but not present in this repo:

- `cloudrun/mcp-gateway/src/mcp/registry.ts`
- `src/services/mcpClient.ts`
- `src/services/mcpGateway.ts`

Active equivalents are under `mcp/mcp-gateway/...` and `frontend/web/src/services/...`.

## Gateway Base URL

Use a placeholder until the active Cloud Run URL is confirmed:

```text
https://mcp-gateway-<region>-<project>.run.app
```

Frontend config keys that may point to the gateway:

- `VITE_MCP_GATEWAY`
- `VITE_MCP_ENDPOINT`
- `VITE_MCP_ENDPOINT_PROD`

Current checked env files do not define those MCP frontend keys. Do not add real endpoint values or secrets without a deployment/config approval.

## Frontend Call Rules

| Frontend/site | Should call MCP Gateway? | Notes |
| --- | --- | --- |
| 2Marines public pages | No direct call by default | Public marketing pages should not execute protected tools. |
| ShieldMate authenticated app | Yes, for protected app workflows | Must send Firebase ID token and org context where required. |
| ShieldMate admin/approvals pages | Yes | Existing `AdminApprovals` posts `toolId: "mcp-google-ads"` through `/mcp/execute`. |
| MarineCoin public pages | No direct call by default | Add only if a protected MarineCoin workflow is designed. |
| Mobile app placeholders | No direct privileged calls | Use backend/gateway only after release and auth design. |

## Auth Model

Protected MCP routes require:

1. `Authorization: Bearer <Firebase ID token>`.
2. Normalized claims from Firebase ID token: `roles`, `orgRoles`, `orgId`, with legacy `role` and `org` compatibility.
3. Role checks in the gateway. Current allowed roles in `mcp/mcp-gateway/src/server.ts` are `super_admin`, `admin`, `org_admin`, `staff`, and `case_worker`.
4. Org checks for org-scoped actions. The gateway rejects missing org claims and rejects a supplied `orgId` that is not in the token claims.
5. Approval records for regulated or mutating actions. Role alone is not enough for external side effects.

Gateway public routes:

- `GET /health`
- `GET /meta`
- `GET /version`

Gateway protected routes:

- `POST /mcp/execute`
- `POST /execute`
- `POST /mcp/tools/:toolId`
- `POST /mcp/context`

## Approval-Gated Actions

These require an explicit approval record even if the caller has the right role:

- Publish social content.
- Spend ad money.
- Create or update Google Ads campaigns, ad groups, keywords, ads, budgets, or bids.
- Update Shopify products, orders, fulfillment, checkout, pricing, or storefront settings.
- Deploy infrastructure, Firebase Hosting, Cloud Functions, rules, Storage, MCP services, or gateway changes.
- Change user roles or custom claims.
- Access, export, or bulk-download sensitive user, org, audit, or document data.
- Submit or mutate Google Play or Apple App Store releases.
- Change billing, account permissions, OAuth apps, or API credentials.

## Read-Only MCP Actions

These may be prepared as non-mutating checks when auth and scope are correct:

- Metrics reads.
- Policy checks.
- Health checks.
- Version/meta checks.
- Content draft generation.
- QA summaries.
- Registry/status checks.
- Approval queue reads for authorized org admins.

## Nine Operating Agents Mapping

| Operating agent | MCP services/connectors | Approval notes |
| --- | --- | --- |
| Project Command Agent | `project-manager-agent`, `document-manager` | Release/deploy decisions require human approval. |
| Codex Engineering Agent | `coder-agent`, `qa-ai-agent`, `mcp-gateway` health/status | No commit, deploy, reset, clean, or destructive git action without explicit instruction. |
| MCP Fleet Registrar Agent | `mcp-gateway`, all MCP status routes, `project-manager-agent` | No delete, rename, parking, or activation without canon approval. |
| Claims Schema Guardian Agent | `qa-ai-agent`, `data-scrubbing-ai`, claims code search | No loosening Firestore rules, App Check, RBAC, or token validation. |
| Marketing Content Agent | `content-generation-ai`, `designer-ai-agent`, `email-campaign-optimizer-ai` | Draft only until publishing/legal approval. |
| Ads + Analytics Agent | `mcp-analytics`, `mcp-google-ads` | Google Ads mutations require approval workflow. |
| Commerce Agent | `amazon-drop-shipping-ai`, `mcp-analytics`, `content-generation-ai` | Shopify changes require account-side approval and server-side credentials only. |
| App Release Agent | `qa-ai-agent`, `document-manager`, app-store connectors if installed | Store submission/signing changes require explicit release approval. |
| QA + Security Agent | `qa-ai-agent`, `data-scrubbing-ai`, `mcp-analytics` read-only | Cannot bypass failing checks or weaken security boundaries. |

## Environment Variable Gaps

No values were added in this audit.

| Area | Finding | Recommended placeholder/action |
| --- | --- | --- |
| Frontend MCP gateway | `.env.2marines`, `.env.shieldmate`, `.env.marinecoin`, and `frontend/web/.env.2marines` do not define `VITE_MCP_GATEWAY` or `VITE_MCP_ENDPOINT`. | Add only non-secret gateway base URL in approved deployment environment. |
| Gateway service registry | `registry.ts` references per-service URL overrides such as `MCP_MCP_GOOGLE_ADS_URL`, `MCP_CONTENT_GENERATION_AI_URL`, and many others. | Document all per-service URL override names in `docs/MCP_ENV_VARS.md` before production hardening. |
| External API credentials | Google Ads, Meta, Shopify Admin, Apple, Google Play, and OpenAI credentials are not present in the checked env files reviewed. | Keep real values in approved secret storage, not frontend env files. |
| App Check | Frontend reads `VITE_FIREBASE_APPCHECK_KEY`; gateway logs App Check presence but does not enforce it. | Decide separately whether gateway App Check enforcement is required. |

## Registry Drift

Mechanical comparison results:

- `mcp_services.csv` services not in gateway registry: none.
- Gateway registry services not in `mcp_services.csv`: none.
- Counts: `mcp_services.csv` = 34, gateway registry service routes = 34.

Additional drift and risk findings:

| Finding | Evidence | Risk | Recommendation |
| --- | --- | --- | --- |
| Frontend legacy MCP operation names are not registered gateway tool IDs. | `useMcpClient.ts` sends `generateResume`, `getReferrals`, `fetchAnalytics`; registry expects tool IDs like `analytics.process` or service IDs. | If `VITE_MCP_ENDPOINT` points at `/mcp/execute`, these calls will not route without an adapter. | Either map these operations to registered tool IDs or keep them pointed at a legacy compatible endpoint. |
| Approval flow references a registered service ID. | `AdminApprovals.tsx` uses `toolId: "mcp-google-ads"`; registry has `mcp-google-ads`. | Registry aligns, but upstream service implementation may still be skeletal. | Keep approval workflow; verify `/execute` is implemented before production execution. |
| Gateway proxies to `/execute`, but sampled skeleton services expose only health/meta/openapi routes. | `mcp-google-ads`, `content-generation-ai`, `reporting-dashboard-ai`, and `qa-ai-agent` sampled `app.py` files do not define `/execute`. | Gateway may return 502 for "route not implemented" after upstream 404. | Add service `/execute` contracts later under separate approved implementation work. |
| Several CSV service paths lack `service.json`. | Missing in `document-manager`, `investment_recommendation`, `project-manager-agent`, `trade_execution_gateway`, `tradefinance_lc`, `tradeops`, `training_to_sop`, `treasury`. | Packaging metadata may be inconsistent across MCPs. | Backfill metadata in a separate doc/config cleanup after confirming desired schema. |
| Underscore service names may not match deployed Cloud Run service naming. | `investment_recommendation`, `trade_execution_gateway`, `tradefinance_lc`, `training_to_sop` appear in CSV and registry. | Cloud Run service names normally use lowercase letters, numbers, and hyphens. | Confirm actual deployed service names; add env var overrides if deployed names are hyphenized. |
| Local fleet inventory and Google Sheet count differ. | Existing docs say local CSV/registry = 34, Google Sheet = 23. | Operational docs may omit 11 services. | Update external sheet later; do not delete or rename MCPs to force a count match. |

## Verification Commands

Read-only local checks used or recommended:

```powershell
$csv = Import-Csv -LiteralPath 'mcp_services.csv'
$registryText = Get-Content -LiteralPath 'mcp\mcp-gateway\src\mcp\registry.ts' -Raw
```

Gateway live checks when a base URL is approved:

```powershell
curl.exe -i "$env:MCP_GATEWAY_BASE_URL/health"
curl.exe -i -X POST "$env:MCP_GATEWAY_BASE_URL/mcp/execute" -H "Content-Type: application/json" -d "{\"toolId\":\"mcp-google-ads\",\"input\":{}}"
```

Expected: health returns a public 200 unless Cloud Run IAM blocks it; protected execution without auth returns 401 or 403.
