# MCP Launch Verification

Last updated: 2026-06-03

## Scope

This checklist verifies MCP gateway health and protected-route behavior for the active 15-day launch campaign. The 90-day framework is future expansion only and is not part of the current commit.

It is a verification plan only and does not approve deployment or mutating MCP actions.

## Expected Gateway Behavior

- `GET /health` should be public and return a healthy response.
- `GET /meta` and `GET /version` are expected to be public metadata routes.
- Protected routes such as `/mcp/execute`, `/execute`, `/mcp/tools/:toolId`, and `/mcp/context` should require a valid Firebase ID token.
- Protected org-scoped actions should reject missing or mismatched organization claims.
- Mutating actions should run only through approved workflows.

## Supervised Agent Approval Model

- Read-only checks may be prepared by an agent.
- Protected-route tests must be scoped, logged, and non-mutating unless separately approved.
- Mutating MCP actions require a human approval record before execution.
- Google Ads, Meta, Firebase, app-store, and billing actions remain outside automatic execution for this launch cycle.

## Current Finding

The local gateway source defines `/health` as public. However, documented live Cloud Run health URLs returned `403 Forbidden` during verification. That suggests Cloud Run ingress or authentication is blocking unauthenticated health checks before the app route is reached.

## Read-Only Verification Steps

- Confirm the active gateway base URL.
- Request `GET /health` without authentication.
- Request `GET /meta` without authentication.
- Request `GET /version` without authentication.
- Confirm each public route returns an expected response.
- Request a protected route without authentication and confirm it rejects access.
- Request a protected route with a valid token and authorized role only in a non-mutating test context.
- Confirm logs show no unexpected errors.

## Protected-Route Expectations

- No token: reject.
- Invalid token: reject.
- Valid token without required role: reject.
- Valid token without required org when org is required: reject.
- Valid token with mismatched `orgId`: reject.
- Valid token with required role and org: allow the intended action only.

## Evidence To Capture

| Check | Expected | Actual | Pass/Fail | Notes |
| --- | --- | --- | --- | --- |
| `/health` public | 200 healthy response | Pending | Pending | Live URL previously returned 403 |
| `/meta` public | Metadata response | Pending | Pending | Pending |
| `/version` public | Version response | Pending | Pending | Pending |
| Protected route without token | 401 or 403 | Pending | Pending | No mutation |
| Protected route with valid token | Authorized only for correct role/org | Pending | Pending | Non-mutating test only |

## Launch Blockers

- Public health checks must be reachable or the ops runbook must explicitly document that Cloud Run requires authenticated health probes.
- Protected routes must fail closed.
- Google Ads or other regulated MCP actions must remain approval-gated.
