# MCP Deploy Runbook

## Prerequisites
- Docker Desktop running
- Google Cloud SDK installed and authenticated
- Active project configured (`gcloud config get-value project`)

## Inputs
- CSV source: `mcp_services.csv`
- Shared Dockerfile: `mcp/Dockerfile.mcp`
- Service index: `ops/mcp_service_index.json`

## Run
1. From repo root:
   `powershell -ExecutionPolicy Bypass -File scripts/mcp_fleet_deploy.ps1`
2. Review the report in `scripts/out/`.

## Notes
- The deploy script continues on failure and records errors per service.
- Health checks use `/health` with retries.
- Set env vars via `--set-env-vars` or update the service configuration.