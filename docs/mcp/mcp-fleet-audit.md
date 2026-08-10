# MCP Fleet Authority Audit

Audit date: 2026-06-01

Canonical repo root: `D:\2marines\Shieldmate`

## Result

Canon 28 remains unresolved. The local repo currently preserves a **34-service working MCP inventory**. The Google Sheet currently documents **23 Cloud Run endpoints**, so the Sheet is incomplete and missing 11 services compared with local CSV.

Local 34-service inventory evidence:

- `platform_bootstrap/bootstrap_manifest.json`: `authoritative_mcp_count` is `34`.
- `platform_bootstrap/mcps/bootstrap_packages.index.json`: 34 bootstrap entries.
- `mcp_services.csv`: 34 service rows.
- `mcp/`: 34 deployable service folders, excluding `common` and `mcp-gateway`.
- `mcp/mcp-gateway/src/mcp/registry.ts`: 34 service routes.
- `platform_bootstrap/shared/smoke_payloads/services/`: 34 service status payloads.
- `docs/MCP_SERVICE_LIST.md`: 34 working inventory services.

Google Sheet update needed later:

- document-manager
- investment_recommendation
- mcp-analytics
- mcp-google-ads
- org-scrubber-mcp
- project-manager-agent
- trade_execution_gateway
- tradefinance_lc
- tradeops
- training_to_sop
- treasury

Do not delete, rename, park, or create MCP folders to resolve the count mismatch.

Found drift:

- `README.md` and `ARCHITECTURE.md` still said 33 deployable service directories before this audit update.
- Archive files under `docs/archive/` may still reference old paths and older service counts; archive material was left untouched.

## Status Legend

- `active`: in disk, deploy index, CSV, gateway registry, and activated at tier 1 or tier 2.
- `canonical`: in disk, deploy index, CSV, and gateway registry, but currently a placeholder or tier 3 service.
- `legacy`: in the local 34-service working inventory, but explicitly transitional/legacy in bootstrap metadata. Do not delete or rename.
- `missing`: expected but not present in disk/index/CSV/gateway.
- `unknown`: present but status cannot be resolved from repo evidence.

## Matrix

| canonical_name | disk_path | deploy_index_key | owner_agent_or_perspective | active_status | evidence_file_paths |
| --- | --- | --- | --- | --- | --- |
| ai-budget-planner | `mcp/ai-budget-planner` | `ai-budget-planner` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-budget-planner.status.request.json` |
| ai-expense-manager | `mcp/ai-expense-manager` | `ai-expense-manager` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-expense-manager.status.request.json` |
| ai-financial-analyst | `mcp/ai-financial-analyst` | `ai-financial-analyst` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-financial-analyst.status.request.json` |
| ai-financial-reporting-specialist | `mcp/ai-financial-reporting-specialist` | `ai-financial-reporting-specialist` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-financial-reporting-specialist.status.request.json` |
| ai-invoice-processor | `mcp/ai-invoice-processor` | `ai-invoice-processor` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-invoice-processor.status.request.json` |
| ai-payroll-manager | `mcp/ai-payroll-manager` | `ai-payroll-manager` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-payroll-manager.status.request.json` |
| ai-tax-compliance-agent | `mcp/ai-tax-compliance-agent` | `ai-tax-compliance-agent` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-tax-compliance-agent.status.request.json` |
| ai-training-coordinator | `mcp/ai-training-coordinator` | `ai-training-coordinator` | `learning_synthesis` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/training.sync.request.json` |
| ai-ux-analyst | `mcp/ai-ux-analyst` | `ai-ux-analyst` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/ai-ux-analyst.status.request.json` |
| amazon-drop-shipping-ai | `mcp/amazon-drop-shipping-ai` | `amazon-drop-shipping-ai` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/amazon-drop-shipping-ai.status.request.json` |
| coder-agent | `mcp/coder-agent` | `coder-agent` | `integration_support` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/coder.analyze.request.json` |
| content-generation-ai | `mcp/content-generation-ai` | `content-generation-ai` | `integration_support` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/content.generate.request.json` |
| cto-agent | `mcp/cto-agent` | `cto-agent` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/cto-agent.status.request.json` |
| data-scrubbing-ai | `mcp/data-scrubbing-ai` | `data-scrubbing-ai` | `validation_normalization` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/data.validate.request.json` |
| designer-ai-agent | `mcp/designer-ai-agent` | `designer-ai-agent` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/designer-ai-agent.status.request.json` |
| document-manager | `mcp/document-manager` | `document-manager` | `orchestrator` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/document.process.request.json` |
| email-campaign-optimizer-ai | `mcp/email-campaign-optimizer-ai` | `email-campaign-optimizer-ai` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/email-campaign-optimizer-ai.status.request.json` |
| fundraising-chatbot-ai | `mcp/fundraising-chatbot-ai` | `fundraising-chatbot-ai` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/fundraising-chatbot-ai.status.request.json` |
| hr-ai-agent | `mcp/hr-ai-agent` | `hr-ai-agent` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/hr-ai-agent.status.request.json` |
| information-retrieval-ai | `mcp/information-retrieval-ai` | `information-retrieval-ai` | `knowledge_retrieval` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/retrieval.search.request.json` |
| investment_recommendation | `mcp/investment_recommendation` | `investment_recommendation` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/investment_recommendation.status.request.json` |
| mcp-analytics | `mcp/mcp-analytics` | `mcp-analytics` | `analytics_feedback` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/analytics.process.request.json` |
| mcp-google-ads | `mcp/mcp-google-ads` | `mcp-google-ads` | `delivery_interface` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/mcp-google-ads.status.request.json` |
| multimodal-ai | `mcp/multimodal-ai` | `multimodal-ai` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/multimodal-ai.status.request.json` |
| org-scrubber-mcp | `mcp/org-scrubber-mcp` | `org-scrubber-mcp` | `validation_normalization` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/org.scrub.request.json` |
| personalized-donation-ai | `mcp/personalized-donation-ai` | `personalized-donation-ai` | `integration_support` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/personalized-donation-ai.status.request.json` |
| project-manager-agent | `mcp/project-manager-agent` | `project-manager-agent` | `orchestrator` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/project.update.request.json` |
| qa-ai-agent | `mcp/qa-ai-agent` | `qa-ai-agent` | `validation_normalization` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/qa.evaluate.request.json` |
| reporting-dashboard-ai | `mcp/reporting-dashboard-ai` | `reporting-dashboard-ai` | `delivery_interface` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/reporting.aggregate.request.json` |
| trade_execution_gateway | `mcp/trade_execution_gateway` | `trade_execution_gateway` | `legacy_transitional` | legacy | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/trade_execution_gateway.status.request.json` |
| tradefinance_lc | `mcp/tradefinance_lc` | `tradefinance_lc` | `legacy_transitional` | legacy | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/tradefinance_lc.status.request.json` |
| tradeops | `mcp/tradeops` | `tradeops` | `legacy_transitional` | legacy | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/tradeops.status.request.json` |
| training_to_sop | `mcp/training_to_sop` | `training_to_sop` | `learning_synthesis` | active | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/orchestrators/sop.generate.request.json` |
| treasury | `mcp/treasury` | `treasury` | `validation_normalization` | canonical | `platform_bootstrap/mcps/bootstrap_packages.index.json`; `mcp_services.csv`; `mcp/mcp-gateway/src/mcp/registry.ts`; `platform_bootstrap/shared/smoke_payloads/services/treasury.status.request.json` |

## No Delete/Rename Actions

No MCP folders were deleted, renamed, parked, or created by this audit. The legacy/transitional entries remain part of the local 34-service working inventory until canon explicitly resolves them.
