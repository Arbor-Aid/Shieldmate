# MCP Health And Protected Route Checks

Purpose: provide safe placeholder command shapes for future MCP gateway checks.

Do not run live API checks unless Joshua explicitly approves the target, token source, and expected result.

## Placeholders

```text
MCP_GATEWAY_BASE_URL
FIREBASE_AUTH_TOKEN_OR_TEST_USER_FLOW
PROTECTED_ROUTE_PATH
```

Never commit tokens. Never paste live tokens into docs, chat, screenshots, or commits.

## Readiness Checklist

- [ ] Confirm the MCP gateway base URL from an approved source.
- [ ] Confirm the protected route path from an approved source.
- [ ] Confirm whether a test user flow or token source is approved.
- [ ] Confirm the request is read-only.
- [ ] Confirm no production mutation will occur.
- [ ] Confirm expected response status and safe output.
- [ ] Confirm logs will not expose sensitive data.

## Example Command Shapes

Health check shape:

```powershell
curl MCP_GATEWAY_BASE_URL/health
```

Protected route shape:

```powershell
curl -H "Authorization: Bearer TOKEN_PLACEHOLDER" MCP_GATEWAY_BASE_URL/PROTECTED_ROUTE_PATH
```

PowerShell variable shape for a local session:

```powershell
$env:MCP_GATEWAY_BASE_URL = "MCP_GATEWAY_BASE_URL"
$env:FIREBASE_AUTH_TOKEN = "TOKEN_PLACEHOLDER"
curl "$env:MCP_GATEWAY_BASE_URL/health"
curl -H "Authorization: Bearer $env:FIREBASE_AUTH_TOKEN" "$env:MCP_GATEWAY_BASE_URL/PROTECTED_ROUTE_PATH"
```

## Result Notes Template

```text
Date:
Checker:
Base URL source:
Health result:
Protected route result:
Token source:
Sensitive output removed:
Follow-up:
```

## Stop Conditions

- Stop if the command requires a real token and no approved token flow exists.
- Stop if the route may mutate data.
- Stop if the base URL is uncertain.
- Stop if output includes secrets, private account data, or user data.
