# MCP Service List

Current working MCP service inventory: **34 services**

Inclusion rule: folders under mcp/ excluding common and mcp-gateway.

mcp-gateway remains the RBAC ingress and is not counted as a fleet service.

## Authority Status

- Canon 28 remains unresolved.
- Local CSV currently documents 34 MCP services.
- Google Sheet currently documents 23 Cloud Run endpoints.
- Sheet is incomplete and missing 11 services compared with local CSV.
- Update the Google Sheet later to include the 11 missing services; do not change the Sheet during repo recovery.
- Do not delete, rename, park, or create MCP folders to resolve this count mismatch.

Missing from Google Sheet compared with local CSV:

- document-manager
- investment_recommendation
- mcp-analytics
- mcp-google-ads
- org-scrubber-mcp
- project-manager-agent
- trade_execution_gateway
- tradefinance_lc
- tradeops
- training_to_sop
- treasury

## Services

- ai-budget-planner: mcp\ai-budget-planner
- ai-expense-manager: mcp\ai-expense-manager
- ai-financial-analyst: mcp\ai-financial-analyst
- ai-financial-reporting-specialist: mcp\ai-financial-reporting-specialist
- ai-invoice-processor: mcp\ai-invoice-processor
- ai-payroll-manager: mcp\ai-payroll-manager
- ai-tax-compliance-agent: mcp\ai-tax-compliance-agent
- ai-training-coordinator: mcp\ai-training-coordinator
- ai-ux-analyst: mcp\ai-ux-analyst
- amazon-drop-shipping-ai: mcp\amazon-drop-shipping-ai
- coder-agent: mcp\coder-agent
- content-generation-ai: mcp\content-generation-ai
- cto-agent: mcp\cto-agent
- data-scrubbing-ai: mcp\data-scrubbing-ai
- designer-ai-agent: mcp\designer-ai-agent
- document-manager: mcp\document-manager
- email-campaign-optimizer-ai: mcp\email-campaign-optimizer-ai
- fundraising-chatbot-ai: mcp\fundraising-chatbot-ai
- hr-ai-agent: mcp\hr-ai-agent
- information-retrieval-ai: mcp\information-retrieval-ai
- investment_recommendation: mcp\investment_recommendation
- mcp-analytics: mcp\mcp-analytics
- mcp-google-ads: mcp\mcp-google-ads
- multimodal-ai: mcp\multimodal-ai
- org-scrubber-mcp: mcp\org-scrubber-mcp
- personalized-donation-ai: mcp\personalized-donation-ai
- project-manager-agent: mcp\project-manager-agent
- qa-ai-agent: mcp\qa-ai-agent
- reporting-dashboard-ai: mcp\reporting-dashboard-ai
- trade_execution_gateway: mcp\trade_execution_gateway
- tradefinance_lc: mcp\tradefinance_lc
- tradeops: mcp\tradeops
- training_to_sop: mcp\training_to_sop
- treasury: mcp\treasury

## Guardrails

- Slack is notification and intake only, never system of record.
- MCP updates must land on canon before endpoint activation.
- Claims-based RBAC remains enforced at the MCP Gateway.
- Placeholder-connected services are not the same as domain-implemented services.

