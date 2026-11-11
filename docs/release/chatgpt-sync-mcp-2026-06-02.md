# ChatGPT Sync - MCP Inventory

Date: 2026-06-02

Repo authority:

- Canon repo path: `D:\2marines\Shieldmate`
- Branch: `ui-rebuild-flutter-gen-ui`
- ShieldMate Canon v2.0 remains authoritative.
- Repo reality is source of truth.
- Do not use stale path `D:\shieldmatessd\Shieldmate_RECLONE` unless explicitly told.

## Current MCP Position

Do not resolve MCP Fleet Authority.

State it exactly this way:

- Canon 28 remains unresolved.
- Local CSV currently documents 34 MCP services.
- Google Sheet currently documents 23 Cloud Run endpoints.
- Sheet is incomplete/missing 11 services compared with local CSV.
- Do not delete, rename, park, or create MCP folders.

Current working inventory source:

- `mcp_services.csv`
- Count: 34 services

Google Sheet state:

- Count: 23 Cloud Run endpoints
- It is an incomplete endpoint snapshot, not the complete local service inventory.
- Update the Google Sheet later to include the 11 missing services.
- Do not change the Sheet during repo recovery unless explicitly approved.

## Missing From Google Sheet Compared With Local CSV

- `document-manager`
- `investment_recommendation`
- `mcp-analytics`
- `mcp-google-ads`
- `org-scrubber-mcp`
- `project-manager-agent`
- `trade_execution_gateway`
- `tradefinance_lc`
- `tradeops`
- `training_to_sop`
- `treasury`

## Local 34-Service Working Inventory

- `ai-budget-planner`
- `ai-expense-manager`
- `ai-financial-analyst`
- `ai-financial-reporting-specialist`
- `ai-invoice-processor`
- `ai-payroll-manager`
- `ai-tax-compliance-agent`
- `ai-training-coordinator`
- `ai-ux-analyst`
- `amazon-drop-shipping-ai`
- `coder-agent`
- `content-generation-ai`
- `cto-agent`
- `data-scrubbing-ai`
- `designer-ai-agent`
- `document-manager`
- `email-campaign-optimizer-ai`
- `fundraising-chatbot-ai`
- `hr-ai-agent`
- `information-retrieval-ai`
- `investment_recommendation`
- `mcp-analytics`
- `mcp-google-ads`
- `multimodal-ai`
- `org-scrubber-mcp`
- `personalized-donation-ai`
- `project-manager-agent`
- `qa-ai-agent`
- `reporting-dashboard-ai`
- `trade_execution_gateway`
- `tradefinance_lc`
- `tradeops`
- `training_to_sop`
- `treasury`

## Docs Updated

Docs-only MCP inventory correction was made:

- `docs/MCP_SERVICE_LIST.md`
  - Changed authority wording to current working inventory.
  - Added Canon 28 unresolved / 34 local / 23 Sheet / 11 missing note.
- `docs/mcp/mcp-fleet-audit.md`
  - Updated result language so 34 is documented as local working inventory, not resolved canon.

No MCP service folders were changed.

## Guardrails

Do not do any of the following without explicit approval:

- Resolve Canon 28 vs 34.
- Delete MCP folders.
- Rename MCP folders.
- Park MCP folders.
- Create MCP folders.
- Change MCP service count.
- Change claims schema, RBAC, App Check, functions, Firestore rules, storage rules, gateway validation, `mcp/common`, or frontend auth.
- Deploy.
- Run Firebase preview deploy.
- Mutate Firebase.
- Change DNS.
- Commit.
- Push.
- Stage.
- Run `git add`.
