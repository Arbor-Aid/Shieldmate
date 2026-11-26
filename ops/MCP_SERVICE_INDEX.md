# MCP Service Index

## Scope
- Operational deployment-index entries: **34**
- Fleet classification authority: `ops/mcp_fleet_contract.json` (**28 Canon + 6 parked**)
- Inclusion rule: folders under `mcp/` excluding `common` and `mcp-gateway`
- Inventory source files:
  - `mcp_services.csv`
  - `ops/mcp_service_index.json`
- Connectivity/mapping artifacts:
  - `ops/mcp_collaboration_matrix.json`
  - `ops/MCP_COLLABORATION_MATRIX.md`
  - `ops/mcp_slack_alias_map.json`
  - `ops/mcp_learning_pipeline_map.json`
- Bootstrap/recovery artifacts:
  - `platform_bootstrap/bootstrap_manifest.json`
  - `platform_bootstrap/mcps/bootstrap_packages.index.json`
  - `platform_bootstrap/mcps/transitional_runtime_status.json`
  - `platform_bootstrap/shared/smoke_payloads/mass_smoke_plan.json`
- Route metadata note: `/health` and `/execute` are required; `/meta` is optional and represented as `meta_path: null` unless explicitly implemented.

The operational index is not a Canon-membership list. `mcp-gateway` is Canon-protected
but excluded from this service index as infrastructure. `document-manager` remains in
the operational index and on disk, but is absent from the fleet contract; its authority
status is unresolved/operational-only and the contract-filtered deploy script skips it.

## State model
- `registered`: appears in inventory and, when needed, in gateway registry mappings.
- `reachable`: serves `GET /health` and `POST /execute` on FastAPI `main.py` with `PORT` fallback `8080`.
- `domain-implemented`: includes real domain logic beyond placeholder/echo behavior.
- Connectivity registration note: each service has a minimal `<service>.status` tool route in gateway for bulk smoke checks.
- `bootstrapped`: service has a machine-readable bootstrap package and deterministic smoke payload references.

## Historical operational posture (34-entry index)
- Registered: 34/34
- Reachable contract: 34/34
- Bootstrapped package coverage: 34/34
- Activated (non-placeholder live behavior): 12/34
  - Tier 1:
    - `document-manager`
    - `mcp-analytics`
    - `project-manager-agent`
    - `ai-training-coordinator`
    - `data-scrubbing-ai`
    - `information-retrieval-ai`
    - `reporting-dashboard-ai`
  - Tier 2:
    - `content-generation-ai`
    - `training_to_sop`
    - `coder-agent`
    - `qa-ai-agent`
    - `org-scrubber-mcp`
- Placeholder-connected services: 22/34
- Transitional runtime note:
  - `project-manager-agent` and `training_to_sop` are activated in `main.py` while `app.py` domain routes remain unmounted.
  - `trade_execution_gateway` remains transitional placeholder in `main.py`; `app.py` routes are not mounted.

## Transitional Runtime Services
- `trade_execution_gateway`
- `investment_recommendation`
- `project-manager-agent`
- `tradefinance_lc`
- `tradeops`
- `training_to_sop`
- `treasury`

## Operational index slugs
- ai-budget-planner
- ai-expense-manager
- ai-financial-analyst
- ai-financial-reporting-specialist
- ai-invoice-processor
- ai-payroll-manager
- ai-tax-compliance-agent
- ai-training-coordinator
- ai-ux-analyst
- amazon-drop-shipping-ai
- coder-agent
- content-generation-ai
- cto-agent
- data-scrubbing-ai
- designer-ai-agent
- document-manager
- email-campaign-optimizer-ai
- fundraising-chatbot-ai
- hr-ai-agent
- information-retrieval-ai
- investment_recommendation
- mcp-analytics
- mcp-google-ads
- multimodal-ai
- org-scrubber-mcp
- personalized-donation-ai
- project-manager-agent
- qa-ai-agent
- reporting-dashboard-ai
- trade_execution_gateway
- tradefinance_lc
- tradeops
- training_to_sop
- treasury
