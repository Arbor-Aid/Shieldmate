# MCP Services

## Overview
- The MCP layer is a set of isolated microservices (27 deployed in this fleet).
- Services are FastAPI ASGI apps served by uvicorn (app:app) using the shared Dockerfile.
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
- Routing and inventory are tracked in `mcp_services.csv` and `ops/mcp_service_index.json`.

## Inventory (deployed URLs)
| Service | Cloud Run | URL | Health |
| --- | --- | --- | --- |
| Ai Budget Planner | ai-budget-planner | https://ai-budget-planner-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Ai Expense Manager | ai-expense-manager | https://ai-expense-manager-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Ai Financial Analyst | ai-financial-analyst | https://ai-financial-analyst-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Ai Financial Reporting Specialist | ai-financial-reporting-specialist | https://ai-financial-reporting-specialist-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Ai Invoice Processor | ai-invoice-processor | https://ai-invoice-processor-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Ai Payroll Manager | ai-payroll-manager | https://ai-payroll-manager-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Ai Tax Compliance Agent | ai-tax-compliance-agent | https://ai-tax-compliance-agent-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Ai Training Coordinator | ai-training-coordinator | https://ai-training-coordinator-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Ai Ux Analyst | ai-ux-analyst | https://ai-ux-analyst-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Amazon Drop Shipping Ai | amazon-drop-shipping-ai | https://amazon-drop-shipping-ai-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Coder Agent | coder-agent | https://coder-agent-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Content Generation Ai | content-generation-ai | https://content-generation-ai-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Cto Agent | cto-agent | https://cto-agent-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Data Scrubbing Ai | data-scrubbing-ai | https://data-scrubbing-ai-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Designer Ai Agent | designer-ai-agent | https://designer-ai-agent-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Email Campaign Optimizer Ai | email-campaign-optimizer-ai | https://email-campaign-optimizer-ai-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Fundraising Chatbot Ai | fundraising-chatbot-ai | https://fundraising-chatbot-ai-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Hr Ai Agent | hr-ai-agent | https://hr-ai-agent-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Information Retrieval Ai | information-retrieval-ai | https://information-retrieval-ai-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Mcp Analytics | mcp-analytics | https://mcp-analytics-yd7bwat7eq-uc.a.run.app | ok (auth) |
| mcp-gateway | mcp-gateway | https://mcp-gateway-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Mcp Google Ads | mcp-google-ads | https://mcp-google-ads-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Multimodal Ai | multimodal-ai | https://multimodal-ai-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Org Scrubber Mcp | org-scrubber-mcp | https://org-scrubber-mcp-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Personalized Donation Ai | personalized-donation-ai | https://personalized-donation-ai-yd7bwat7eq-uc.a.run.app | ok (direct) |
| Qa Ai Agent | qa-ai-agent | https://qa-ai-agent-yd7bwat7eq-uc.a.run.app | ok (auth) |
| Reporting Dashboard Ai | reporting-dashboard-ai | https://reporting-dashboard-ai-yd7bwat7eq-uc.a.run.app | ok (auth) |

## Docs
- `ops/MCP_SERVICE_CONTRACT.md`
- `ops/MCP_SERVICE_INDEX.md`
- `ops/MCP_DEPLOY_RUNBOOK.md`
- `ops/MCP_RECOVERY_SCAN.md`
