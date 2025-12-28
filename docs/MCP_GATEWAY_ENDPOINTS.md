# MCP Gateway Endpoints (Authoritative)

Base URL:
- Use the configured gateway base URL (no trailing slash).
- Example placeholder: `https://mcp-gateway-<region>-<project>.run.app`

Auth model:
- Protected endpoints require `Authorization: Bearer <Firebase ID token>`.
- App Check is not enforced at the gateway; presence is logged only.
- super_admin is the only global override (enforced inside protected routes).

## Endpoint Inventory

| Method | Path | Purpose | Auth Required | App Check Required | Approval Gated |
| --- | --- | --- | --- | --- | --- |
| GET | `/health` | Deployment health check (no dependencies) | No | No | No |
| GET | `/version` | Returns build/version identifier | No | No | No |
| POST | `/mcp/execute` | Execute tool via gateway contract | Yes | No (logged) | No (handled downstream) |
| POST | `/mcp/tools/:toolId` | Tool-specific proxy route | Yes | No (logged) | No (handled downstream) |
| POST | `/mcp/context` | Tool context route | Yes | No (logged) | No (handled downstream) |

Notes:
- All protected routes fail closed on missing/invalid tokens.
- Gateway does not log tokens, claims, or PII. Logs include method, path, hasAuth, hasAppCheck, status.

## Local Verification (curl)

Replace `MCP_GATEWAY_BASE_URL` with the live gateway URL.

Health check:
```bash
curl -i "$MCP_GATEWAY_BASE_URL/health"
```
Expected: `200` with `{"status":"ok"}`.

Protected endpoint without auth (should be denied and logged):
```bash
curl -i -X POST "$MCP_GATEWAY_BASE_URL/mcp/execute" \
  -H "Content-Type: application/json" \
  -d '{"toolId":"<toolId>","input":{}}'
```
Expected: `401/403` and a log entry with `hasAuth=false`.

Note: `orgId` is derived from verified claims. If a request includes `orgId`,
the gateway will verify it against token claims and reject mismatches.
