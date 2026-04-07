# MCP Recovery Scan

## Purpose
Operational snapshot of MCP contract conformance and routing posture after the routing hardening baseline on `feature/document-manager-routing`.

## Current snapshot
- Scan date: 2026-04-06
- Scan root: `mcp/`
- Authoritative MCP folders (excluding `common`, `mcp-gateway`): **34**
- Bootstrap root: `platform_bootstrap/` (present)

## Conformance result
- `main.py` present: 34/34
- `GET /health` present: 34/34
- `POST /execute` present: 34/34
- `PORT` fallback runtime entrypoint: 34/34
- Per-MCP bootstrap package present: 34/34 (`platform_bootstrap/mcps/<service>/bootstrap_package.json`)

## Routing and chaining posture
- Gateway-level routing: working with registry-driven dispatch.
- `document-manager` chaining: working and environment-driven via `MCP_GATEWAY_EXECUTE_URL`.
- Authorization passthrough for chained calls: implemented in `document-manager`.
- Downstream behavior caveat: many MCPs are still placeholder/echo handlers.
- Bulk connectivity posture: `<service>.status` tool route registered per MCP for mass smoke checks.
- Mass smoke payload corpus present: `platform_bootstrap/shared/smoke_payloads/`
- Windows/Drive/Notion readiness structures present under `platform_bootstrap/integrations/`

## Role clarification
- `mcp-gateway`: ingress + RBAC + proxy routing.
- `trade_execution_gateway`: regular service inventory member, not ingress.
- Transitional services with documented inactive `app.py` domain routes:
  - `trade_execution_gateway`
  - `investment_recommendation`
  - `project-manager-agent`
  - `tradefinance_lc`
  - `tradeops`
  - `training_to_sop`
  - `treasury`

## Authoritative sources
- `mcp_services.csv`
- `ops/mcp_service_index.json`
- `README_MCPs.md`
- `ops/mcp_collaboration_matrix.json`
- `ops/mcp_slack_alias_map.json`
- `ops/mcp_learning_pipeline_map.json`
- `platform_bootstrap/bootstrap_manifest.json`
- `platform_bootstrap/mcps/transitional_runtime_status.json`
- `platform_bootstrap/shared/smoke_payloads/mass_smoke_plan.json`
