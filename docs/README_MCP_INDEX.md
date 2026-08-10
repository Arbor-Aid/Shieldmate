# MCP Service Index

## Overview
ShieldMate MCP services follow a contract-first model with uniform health and metadata endpoints. See `docs/MCP_SERVICE_CONTRACT.md` for the canonical contract.

## Services
| Service | Folder | Cloud Run Service Name | URL | Endpoints | Required Env Vars | Slack Channel |
| --- | --- | --- | --- | --- | --- | --- |
| mcp-gateway | mcp/mcp-gateway | mcp-gateway |  | /health, /meta, /openapi.json | PORT, SERVICE_NAME, SERVICE_VERSION, GIT_SHA, K_REVISION, LOG_LEVEL | #mcp-mcp-gateway |

## Slack channels
- #project-manager-agent (deploy/build alerts)
- #mcp-<service>

## Dataset pointers
- DATASET_BASE_URL should point to `/data` on the public website.
- /data/programs.seed.json
- /data/orgs.seed.json
- /data/tie.seed.json