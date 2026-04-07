# MCP Services

## Overview
- Authoritative MCP service count: **34** (`mcp/` folders excluding `common` and `mcp-gateway`).
- `mcp-gateway` is the ingress tier and is not part of the 34-service count.
- Shared runtime/deploy pattern uses `mcp/Dockerfile.mcp` with `uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}`.

## Runtime standard
- Every MCP service runs as Python FastAPI with `main.py` entrypoint.
- Required endpoints:
  - `GET /health`
  - `POST /execute`
- Optional/legacy endpoint: `GET /meta` is not guaranteed fleet-wide.
- Runtime port comes from `PORT` environment variable with fallback `8080`.
- Service identity should support `MCP_SERVICE_NAME` override with `SERVICE_NAME`/`SERVICE_SLUG` fallback.
- Standard execute request envelope:
  ```json
  {
    "toolId": "string",
    "tool": "string",
    "input": {}
  }
  ```
- `toolId` is canonical; `tool` is accepted as a backward-compatible alias.
- Standard response envelope is JSON with `ok`, `status`, `service`, and result/error fields.
- Placeholder services are allowed, but they must still conform to the same envelope and endpoints.

## Gateway contract
- `mcp-gateway` is the only supported ingress for tool execution.
- Canonical execute route: `POST /mcp/execute`.
- Compatibility execute alias: `POST /execute` (kept for backward compatibility).
- Canonical request field: `toolId`.
- Backward-compatible request alias: `tool`.
- Gateway normalizes to `toolId` internally before dispatch.
- Gateway routing is registry-driven (`mcp/mcp-gateway/src/mcp/registry.ts`).
- Tool registration alone is not enough for end-to-end success: downstream service behavior still matters.
- Required chained tool registrations currently include:
  - `analytics.process -> mcp-analytics`
  - `project.update -> project-manager-agent`
  - `training.sync -> ai-training-coordinator`
  - `data.validate -> data-scrubbing-ai`
  - `document.process -> document-manager`
- Fleet connectivity registrations also include minimal status routes:
  - `<service>.status -> <service>` for each authoritative MCP service
  - these are intended for bulk smoke routing checks, not deep domain semantics

## Chained execution model
- Current working local flow:
  - `uploader -> mcp-gateway -> document-manager`
  - `document-manager -> mcp-gateway -> downstream tool service`
- Chained calls from `document-manager` use `MCP_GATEWAY_EXECUTE_URL` with canonical local default `http://localhost:8090/mcp/execute`.
- `document-manager` now sends canonical `toolId` and compatibility `tool` in chained requests.
- Downstream placeholder handlers may still return stub/echo results even when routing is correct.

## Auth/RBAC note
- Gateway requests require Firebase ID tokens and claims-based RBAC.
- `document-manager` now forwards `Authorization` in chained gateway calls when present.
- Gateway registry routing and auth checks both must pass for safe end-to-end tool chaining.

## Service inventory note
- Inventory source files:
  - `mcp_services.csv`
  - `ops/mcp_service_index.json`
- Bulk connectivity metadata artifacts:
  - `ops/mcp_collaboration_matrix.json`
  - `ops/MCP_COLLABORATION_MATRIX.md`
  - `ops/mcp_slack_alias_map.json`
  - `ops/mcp_learning_pipeline_map.json`
- State definitions:
  - `registered`: route exists in gateway registry and inventory.
  - `reachable`: service answers `/health` and can be proxied.
  - `domain-implemented`: service has real business logic beyond placeholder/echo behavior.
- Bootstrap definitions:
  - `connected`: contract + routing + inventory alignment are in place.
  - `bootstrapped`: connected plus standardized `platform_bootstrap/` data/config/smoke structure exists for cold restart and mass checks.
- Inventory metadata uses `meta_path: null` by default unless a service explicitly implements `/meta`.

## Bootstrap Layout
- Bootstrap root: `platform_bootstrap/`
- Key subtrees:
  - `platform_bootstrap/shared/` for geography, demographics, org profiles, taxonomies, Google Ads, shared schemas/templates/prompts
  - `platform_bootstrap/integrations/` for Firebase, Google Drive, Notion, Slack, Windows admin tools readiness structures
  - `platform_bootstrap/mcps/<service>/` per-MCP bootstrap package + config/seed_data/schema/prompt/smoke paths
  - `platform_bootstrap/shared/smoke_payloads/` reusable mass-test payloads
- Bootstrap manifests:
  - `platform_bootstrap/bootstrap_manifest.json`
  - `platform_bootstrap/mcps/bootstrap_packages.index.json`
  - `platform_bootstrap/mcps/transitional_runtime_status.json`
  - `platform_bootstrap/shared/smoke_payloads/mass_smoke_plan.json`

## Reboot And Rehydrate
- Validate bootstrap structure:
  - `powershell -ExecutionPolicy Bypass -File scripts/mcp_bootstrap_rehydrate.ps1`
- Run mass smoke from bootstrap payloads:
  - `powershell -ExecutionPolicy Bypass -File scripts/mcp_mass_smoke_from_bootstrap.ps1`
- Optional functional + integration payload pass:
  - `powershell -ExecutionPolicy Bypass -File scripts/mcp_mass_smoke_from_bootstrap.ps1 -IncludeFunctional`
- Use `MCP_SMOKE_AUTH_TOKEN` env var for authenticated gateway checks when required.

## Integration Readiness
- Windows admin tools are first-class ingestion sources via:
  - `platform_bootstrap/integrations/windows_admin_tools/`
- Google Drive readiness structure:
  - `platform_bootstrap/integrations/google_drive/`
- Notion readiness structure:
  - `platform_bootstrap/integrations/notion/`
- Shared data catalog:
  - `platform_bootstrap/shared/dataset_catalog.json`

## mcp-gateway vs trade_execution_gateway
- `mcp-gateway` is the ingress and RBAC proxy tier for all MCP tool execution.
- `trade_execution_gateway` is a regular MCP service in the fleet inventory (trade domain), not an ingress replacement.
- Current runtime truth for `trade_execution_gateway`: `main.py` placeholder MCP contract is active; domain routes in `app.py` are transitional and not mounted by the active entrypoint.
- Additional transitional services with `app.py` domain logic not mounted by active `main.py`:
  - `investment_recommendation`
  - `project-manager-agent`
  - `tradefinance_lc`
  - `tradeops`
  - `training_to_sop`
  - `treasury`

## Authoritative 34-service list
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

## Operational caveat
- **Registered != fully implemented**. A tool can be registered and reachable while still returning placeholder semantics until domain logic is completed.
