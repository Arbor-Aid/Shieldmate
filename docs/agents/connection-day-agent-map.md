# Connection Day Agent Map

Audit date: 2026-06-01

Source references:

- `docs/AGENT_ARCHITECTURE.md`
- `docs/MCP_SERVICE_LIST.md`
- `docs/MCP_SERVICE_CONTRACT.md`
- `docs/SYSTEM_OF_RECORD.md`
- `platform_bootstrap/mcps/bootstrap_packages.index.json`
- `mcp/mcp-gateway/src/mcp/registry.ts`

## Operating Agents

| Agent | Purpose | Allowed MCPs/connectors | Prohibited actions | Human approval required | Source files/docs owned |
| --- | --- | --- | --- | --- | --- |
| Project Command Agent | Coordinate delivery order, status, and cross-agent handoffs. | `project-manager-agent`, `document-manager`, read-only docs/search. | Cannot bypass branch guardrails, rewrite canon without evidence, or approve regulated external actions. | Canon changes, parking legacy services, release/deploy decisions. | `docs/DEV_OPERATIONS.md`, `docs/SYSTEM_OF_RECORD.md`, `docs/ops/`, `platform_bootstrap/bootstrap_manifest.json`. |
| Codex Engineering Agent | Implement scoped code/docs changes and run local verification. | Repo filesystem, `coder-agent`, `qa-ai-agent`, `mcp-gateway` status routes when available. | Cannot overwrite dirty user work, loosen RBAC/security rules, commit/deploy without instruction, or touch private env values. | Destructive git operations, dependency installs outside project scope, production deploys. | Source files changed by task, `README.md`, `ARCHITECTURE.md`, QA notes. |
| MCP Fleet Registrar Agent | Maintain MCP inventory, service routes, smoke payload evidence, and active/legacy status. | `mcp-gateway`, `document-manager`, all MCP status tools, `project-manager-agent`. | Cannot delete/rename MCP folders or mark services parked without canon approval. | Parking, decommissioning, new service activation, Cloud Run route changes. | `docs/mcp/mcp-fleet-audit.md`, `docs/MCP_SERVICE_LIST.md`, `mcp_services.csv`, `platform_bootstrap/mcps/bootstrap_packages.index.json`. |
| Claims Schema Guardian Agent | Keep claims schema unified across rules, functions, gateway, MCP common auth, and frontends. | `qa-ai-agent`, `data-scrubbing-ai`, claims-related code search. | Cannot loosen Firestore rules, add email-only auth, or accept Slack/social identity as auth. | Any behavior change to claims writers, rules, gateway authorization, or production token minting. | `docs/claims/claims-schema-audit.md`, `firestore.rules`, `backend/firebase/functions/index.ts`, `mcp/mcp-gateway/src/auth/`, `mcp/common/auth.py`. |
| Marketing Content Agent | Produce grounded campaign copy, social post inputs, and public link references. | `content-generation-ai`, `designer-ai-agent`, `email-campaign-optimizer-ai`, Canva connector by human request. | Cannot invent approved testimonials, legal claims, pricing, discounts, or final social/store URLs. | Publishing content, brand/legal claims, final URL insertion, Canva bulk production. | `docs/marketing/marketing-links-registry.md`, `docs/marketing/canva-bulk-csv-schema.md`, marketing copy docs. |
| Ads + Analytics Agent | Manage event taxonomy, UTM conventions, Ads/GTM readiness, and regulated campaign buckets. | `mcp-analytics`, `mcp-google-ads` through approval workflow only. | Cannot launch spend, mutate Google Ads, duplicate tracking snippets, or store ad credentials client-side. | Any Google Ads mutating action, GTM container publish, conversion import, budget/bid changes. | `docs/marketing/ads-tracking-plan.md`, `docs/google-ads-approvals.md`, `docs/mcp-google-ads.md`, `frontend/web/src/lib/firebase.ts`. |
| Commerce Agent | Coordinate Shopify/storefront links, commerce CTAs, and Marine Coins storefront readiness. | `amazon-drop-shipping-ai`, `mcp-analytics`, `content-generation-ai`; Shopify only through approved account-side tools. | Cannot hard-code Shopify admin URLs, modify dirty Shopify env/shop work, or change checkout tracking without approval. | Storefront URL cutover, checkout/purchase tracking, product publication, pricing. | `frontend/web/src/config/marketingLinks.ts`, `frontend/web/src/pages/twomarines/StoreRedirect.tsx`, `docs/marketing/marketing-links-registry.md`. |
| App Release Agent | Track mobile app identifiers, store metadata, screenshots, privacy/support URLs, and release gates. | `qa-ai-agent`, `document-manager`, app-store account connectors only if explicitly installed/authorized. | Cannot change bundle IDs/package names, signing, or store metadata without account confirmation. | Bundle/package ID changes, signing config, store submission, privacy/support URL publication. | `docs/release/app-store-readiness.md`, `frontend/flutter/pubspec.yaml`, `frontend/flutter/android/app/build.gradle`, `frontend/flutter/ios/Runner/Info.plist`. |
| QA + Security Agent | Verify checks, security boundaries, route behavior, and stop-list compliance. | `qa-ai-agent`, `data-scrubbing-ai`, local test runners, `mcp-analytics` read-only. | Cannot bypass failing checks, mark unverified systems ready, or weaken App Check/RBAC. | Accepting unresolved blockers, changing security enforcement, decommissioning legacy machines. | QA result notes, `docs/claims/claims-schema-audit.md`, `docs/mcp/mcp-fleet-audit.md`, test configs. |

## Shared Guardrails

- MCP is the only tool gateway for privileged actions.
- Firebase custom claims remain the authorization source.
- Slack is notification/intake only and never the system of record.
- Human approval is required for destructive changes, regulated external actions, production deploys, account-side credential work, and legacy parking/decommissioning.
