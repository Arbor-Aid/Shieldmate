# MCP Service Contract

This contract standardizes all ShieldMate MCP services for build, deploy, and runtime behavior.

## Required endpoints
- GET /health
  - 200 JSON: {"status":"ok","service":"<slug>","version":"<ver>","time":"<iso>"}
- GET /meta
  - 200 JSON: {
    "name":"<display_name>",
    "slug":"<slug>",
    "description":"<description>",
    "routes":[...],
    "env_vars_required":[...],
    "supports":{"tools":[...],"data":[...]},
    "build":{"python":"<version>"},
    "timestamp":"<iso>"
  }
- GET /openapi.json (FastAPI default)

## Runtime
- Listen on 0.0.0.0:8080
- Stateless (no local persistence)
- No PII in logs

## Configuration
- All config via environment variables
- Never hardcode secrets
- Do not print secrets

## Required environment variables
- PORT (default 8080)
- SERVICE_NAME
- SERVICE_SLUG
- SERVICE_VERSION
- SERVICE_DESCRIPTION
- LOG_LEVEL
- GIT_SHA
- K_REVISION

## Observability
- JSON-ish structured logs
- Include request identifiers when available
- Safe error responses

## Security
- No auth bypass paths
- Safe failure mode when dependencies are unavailable
- No MCP-to-MCP runtime dependency
