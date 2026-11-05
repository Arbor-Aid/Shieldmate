# MCP Service Index

## Overview
ShieldMate MCP services follow a contract-first model with uniform health and metadata endpoints. See `docs/MCP_SERVICE_CONTRACT.md` for the canonical contract.

Fleet classification is governed by `ops/mcp_fleet_contract.json`: **28 Canon** and
**6 parked**. The separate 34-entry `ops/mcp_service_index.json` is historical/operational
deployment inventory, not membership authority. It includes the unresolved operational-only
`document-manager` and excludes the infrastructure gateway `mcp-gateway` by design.

`project-manager-agent` is Canon and has an observed Cloud Run service, but that observation
does not establish health or correct behavior. The similarly named live legacy candidates
`mcp-analytic` and `mcp-google-ad` remain deferred for cloud legacy review and are not added
to the Canon contract.

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
