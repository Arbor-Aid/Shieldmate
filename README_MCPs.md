# MCP Services

## Overview
- The MCP layer is a set of isolated microservices (approximately 30 in scope; 24 listed in `mcp_services.csv`).
- Services are FastAPI ASGI apps served by uvicorn (`app:app`) using the shared Dockerfile.
- Each service is deployed as an independent Cloud Run service.

## Shared Dockerfile
Location: `mcp/Dockerfile.mcp`

Key properties:
- Base image: python:3.11-slim
- Copies `common/` plus the service path into `/app`
- Installs dependencies from `requirements.txt`
- Exposes port 8080 and runs uvicorn on 0.0.0.0:8080

## Isolation rules (mandatory)
- Stateless services; no local state beyond the request lifecycle.
- No MCP-to-MCP calls or shared runtime state.
- No hardcoded secrets; configuration is provided via environment variables.
- Independent Cloud Run deploys for every MCP service.

## Gateway contract
- MCP Gateway is the only ingress for tool execution.
- Requests require Firebase ID tokens and claims-based RBAC enforcement.
- Routing and inventory are tracked in `mcp_services.csv`.

## Inventory
- `mcp_services.csv` lists service name, slug, local port, and Cloud Run URL patterns.
