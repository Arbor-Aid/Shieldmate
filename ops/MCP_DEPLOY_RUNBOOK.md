# MCP Deploy Runbook

## Prerequisites
- Docker Desktop running
- Google Cloud SDK installed and authenticated
- Active project configured (`gcloud config get-value project`)

## Inputs
- Service inventory: `mcp_services.csv` and `ops/mcp_service_index.json`
- Fleet size: 34 MCP services (excludes `mcp-gateway` ingress)
- Shared Dockerfile: `mcp/Dockerfile.mcp`
- Bootstrap root: `platform_bootstrap/`
- Bootstrap package index: `platform_bootstrap/mcps/bootstrap_packages.index.json`
- Smoke plan: `platform_bootstrap/shared/smoke_payloads/mass_smoke_plan.json`

## Deploy
1. From repo root, run:
   `powershell -ExecutionPolicy Bypass -File scripts/mcp_fleet_deploy.ps1`
2. Review report output in `scripts/out/`.

## Bootstrap Rehydrate
1. Validate local bootstrap structure:
   `powershell -ExecutionPolicy Bypass -File scripts/mcp_bootstrap_rehydrate.ps1`
2. Confirm per-MCP bootstrap packages exist:
   - `platform_bootstrap/mcps/<service>/bootstrap_package.json`
3. Confirm transitional runtime status file:
   - `platform_bootstrap/mcps/transitional_runtime_status.json`

## Runtime assumptions
- Each MCP service uses `main.py` FastAPI contract (`/health`, `/execute`, `PORT` fallback `8080`).
- `mcp-gateway` remains separately deployed as ingress and RBAC proxy.
- Chained tool execution depends on both:
  - gateway registry entry (`mcp/mcp-gateway/src/mcp/registry.ts`)
  - downstream service implementation for requested tool behavior
- Fleet connectivity routes include `<service>.status` tools for each MCP to support broad smoke routing checks.
- Activation slice (current):
  - Tier 1 activated tools: `document.process`, `analytics.process`, `project.update`, `training.sync`, `data.validate`, `retrieval.search`, `reporting.aggregate`
  - Tier 2 activated tools: `content.generate`, `sop.generate`, `coder.analyze`, `qa.evaluate`, `org.scrub`
- Transitional services intentionally keep placeholder `main.py` active in this pass; `app.py` domain routes are documented but unmounted.

## Mass smoke strategy
1. Verify `GET /health` for all services from inventory.
2. Through gateway, execute `<service>.status` for all 34 services.
3. Verify known functional routes still pass:
   - `document.process`
   - `analytics.process`
   - `project.update`
   - `training.sync`
   - `data.validate`
   - `retrieval.search`
   - `reporting.aggregate`
4. Triage failures by category:
   - `registered` failure (registry/inventory mismatch)
   - `reachable` failure (health/execute unreachable)
   - `domain-implemented` gap (placeholder or unimplemented business logic)
5. Run scripted smoke from bootstrap plan:
   - `powershell -ExecutionPolicy Bypass -File scripts/mcp_mass_smoke_from_bootstrap.ps1`
6. For functional + integration readiness payloads:
   - `powershell -ExecutionPolicy Bypass -File scripts/mcp_mass_smoke_from_bootstrap.ps1 -IncludeFunctional`
   - this now includes `activation_payloads` (Tier 2 activation checks) from `mass_smoke_plan.json`

## Troubleshooting checklist
1. Verify service health (`/health`) and ingress logs.
2. Verify gateway registry mapping for the failing `toolId`.
3. Verify downstream MCP `/execute` supports the requested tool semantics.
4. If chaining is involved, verify `MCP_GATEWAY_EXECUTE_URL` and Authorization passthrough behavior.

## Notes
- Deploy script continues on per-service failures and records each failure.
- Health checks retry before marking failure.
- Keep env configuration in Cloud Run or deploy flags; do not hardcode service URLs.
- Collaboration and exposure metadata are maintained in:
  - `ops/mcp_collaboration_matrix.json`
  - `ops/mcp_slack_alias_map.json`
  - `ops/mcp_learning_pipeline_map.json`
- Bootstrap and integration readiness metadata are maintained in:
  - `platform_bootstrap/bootstrap_manifest.json`
  - `platform_bootstrap/shared/dataset_catalog.json`
  - `platform_bootstrap/integrations/windows_admin_tools/consumer_map.json`
  - `platform_bootstrap/integrations/google_drive/consumer_map.json`
  - `platform_bootstrap/integrations/notion/consumer_map.json`
