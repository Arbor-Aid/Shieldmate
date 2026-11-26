# MCP Service Audit

## Services updated
- mcp-gateway

## Endpoints added or standardized
- mcp-gateway: added /meta, standardized /health response (app.py and src/server.ts).

## Requirements
- mcp-gateway: created requirements.txt with fastapi and uvicorn[standard].

## Descriptors
- mcp-gateway: created service.json with canonical contract metadata.

## Risky findings (no secrets)
- mcp-gateway registry contains hardcoded Cloud Run URLs in `mcp/mcp-gateway/src/mcp/registry.ts`.