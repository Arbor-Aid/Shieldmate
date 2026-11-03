# MCP Service Contract

This contract defines the enforceable baseline for all ShieldMate MCP services in `mcp/` (excluding `common` and `mcp-gateway`).

## Required runtime contract
- Runtime: Python FastAPI
- Entrypoint: `main.py`
- Required endpoints:
  - `GET /health`
  - `POST /execute`
- Optional/legacy endpoint: `GET /meta` only when explicitly implemented.
- Runtime port: `PORT` env var with fallback `8080`
- Service identity env support: `MCP_SERVICE_NAME` with `SERVICE_NAME`/`SERVICE_SLUG` fallback
- Responses: JSON only

## Standard request envelope
`POST /execute` requests use:

```json
{
  "toolId": "string",
  "tool": "string",
  "input": {}
}
```

Gateway ingress accepts both request field styles for compatibility:
- Canonical: `toolId`
- Alias: `tool`
- Gateway normalizes to `toolId` before dispatch.

## Standard response envelope
Services should return JSON with this shape (extra fields allowed):

```json
{
  "ok": true,
  "status": "processed",
  "service": "service-slug",
  "tool": "tool.name",
  "result": {}
}
```

Error responses should return:

```json
{
  "ok": false,
  "status": "error",
  "service": "service-slug",
  "tool": "tool.name",
  "error": "error-code",
  "detail": "human-readable detail"
}
```

For activated MCPs, include structured output blocks when applicable:
- `summary_card`
- `status_badge`
- `data_table`
- `timeline_event` or `timeline_events`
- `alerts`
- `action_list`

## Chaining and gateway rule
- `mcp-gateway` is the only ingress for tool execution.
- Canonical ingress execute path: `POST /mcp/execute`
- Compatibility alias execute path: `POST /execute`
- Service-to-service tool chaining must call gateway, not direct downstream services.
- Use `MCP_GATEWAY_EXECUTE_URL` for gateway target configuration in services that chain.
- Keep a local default URL for development, but do not hardcode production URLs.

## Auth and RBAC expectations
- Gateway validates Firebase token claims and org/role RBAC.
- Chained services should forward `Authorization` when present.
- Downstream services must treat org/user fields as untrusted unless enforced by gateway.

## Placeholder policy
- Placeholder MCPs are allowed during rollout.
- Placeholder MCPs must still satisfy the full runtime contract (`main.py`, `/health`, `/execute`, `PORT`).
- Placeholder status must be explicit in JSON responses.

## Bootstrapped readiness layer
- Connected != bootstrapped.
- `connected` means contract/routing/inventory alignment exists.
- `bootstrapped` means connected plus deterministic bootstrap artifacts exist under `platform_bootstrap/`:
  - per-service package: `platform_bootstrap/mcps/<service>/bootstrap_package.json`
  - shared smoke plan: `platform_bootstrap/shared/smoke_payloads/mass_smoke_plan.json`
  - integration readiness roots for Firebase, Google Drive, Notion, Slack, Windows admin tools
  - shared dataset roots for geography, demographics, org profiles, taxonomies, Google Ads

## Activation metadata conventions
Machine-readable inventory artifacts should maintain these fields:
- `activation_level` (`tier1_activated`, `tier2_activated`, `tier3_placeholder`)
- `runtime_mode` (for example `activated_main`, `activated_transitional_main_active`, `placeholder_connected`)
- `live_behavior_present`
- `consumes_bootstrap_data`
- `writes_structured_records`
- `frontend_safe_output`
- `slack_trigger_ready`

## Transitional runtime policy
- Services with domain routes in `app.py` may remain in transitional mode with placeholder `main.py` active when safer.
- Transitional mode must be explicit in service responses and index metadata (`runtime_mode`, `runtime_note`).
- Do not mount `app.py` routes in bulk passes unless risk is low and behavior is validated.

## Reusable template pattern
Use this minimal pattern for new MCPs:

```python
import os
from typing import Any, Dict
from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv("MCP_SERVICE_NAME", os.getenv("SERVICE_NAME", os.getenv("SERVICE_SLUG", "mcp-service")))
SERVICE_SLUG = os.getenv("SERVICE_SLUG", "mcp-service")

app = FastAPI(title=SERVICE_NAME)

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": SERVICE_SLUG}

@app.post("/execute")
async def execute(request: Request) -> Dict[str, Any]:
    data = await request.json()
    tool = data.get("toolId") or data.get("tool")
    input_data = data.get("input", {})
    return {
        "ok": True,
        "status": "placeholder",
        "service": SERVICE_SLUG,
        "tool": tool,
        "input": input_data,
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
```
