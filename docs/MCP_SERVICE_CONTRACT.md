# MCP Service Contract

This document defines the canonical contract for all ShieldMate MCP services.

## A) Identity
Each service must declare:
- service_name
- version
- owner (2Marines)
- description

## B) Required endpoints
Every MCP service must expose the following endpoints:
- GET /health -> 200 {"status":"ok","service":"<name>","version":"<ver>","time":"<iso>"}
- GET /meta -> 200 {"service":"<name>","version":"<ver>","capabilities":[...],"inputs":[...],"outputs":[...]}
- GET /openapi.json (FastAPI default)

## C) Port / runtime
- Listen on 0.0.0.0:8080.
- Stateless execution only.
- No PII in logs.

## D) Config / env vars
- Read configuration via environment variables only.
- Never hardcode secrets or sensitive values.
- Do not log secrets.

## E) Observability
- Structured logs (JSON-ish).
- Include request identifiers when available.
- Return safe, user-friendly errors without leaking internal details.

## F) Security
- No auth bypass paths.
- No secrets in code or images.
- Fail safely when dependencies are unavailable.