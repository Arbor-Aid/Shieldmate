const CLOUD_RUN_DOMAIN = 'yd7bwat7eq-uc.a.run.app';
const USE_LOCALHOST = process.env.MCP_USE_LOCALHOST === 'true';
const LOCALHOST_BASE_URL = process.env.MCP_LOCALHOST_BASE_URL || 'http://localhost:8080';
const DOCUMENT_PROCESS_TOOL = {
  tool: 'document.process',
  service: 'document-manager',
  path: '/execute',
} as const;

function defaultServiceUrl(slug: string): string {
  if (USE_LOCALHOST) {
    return LOCALHOST_BASE_URL;
  }
  return `https://${slug}-${CLOUD_RUN_DOMAIN}`;
}

function serviceUrl(slug: string, envVar: string): string {
  return process.env[envVar] || defaultServiceUrl(slug);
}

export const MCP_REGISTRY: Record<string, string> = {
  "ai-budget-planner": serviceUrl("ai-budget-planner", "MCP_AI_BUDGET_PLANNER_URL"),
  "ai-expense-manager": serviceUrl("ai-expense-manager", "MCP_AI_EXPENSE_MANAGER_URL"),
  "ai-financial-analyst": serviceUrl("ai-financial-analyst", "MCP_AI_FINANCIAL_ANALYST_URL"),
  "ai-financial-reporting-specialist": serviceUrl("ai-financial-reporting-specialist", "MCP_AI_FINANCIAL_REPORTING_SPECIALIST_URL"),
  "ai-invoice-processor": serviceUrl("ai-invoice-processor", "MCP_AI_INVOICE_PROCESSOR_URL"),
  "ai-payroll-manager": serviceUrl("ai-payroll-manager", "MCP_AI_PAYROLL_MANAGER_URL"),
  "ai-tax-compliance-agent": serviceUrl("ai-tax-compliance-agent", "MCP_AI_TAX_COMPLIANCE_AGENT_URL"),
  "ai-training-coordinator": serviceUrl("ai-training-coordinator", "MCP_AI_TRAINING_COORDINATOR_URL"),
  "ai-ux-analyst": serviceUrl("ai-ux-analyst", "MCP_AI_UX_ANALYST_URL"),
  "amazon-drop-shipping-ai": serviceUrl("amazon-drop-shipping-ai", "MCP_AMAZON_DROP_SHIPPING_AI_URL"),
  "coder-agent": serviceUrl("coder-agent", "MCP_CODER_AGENT_URL"),
  "content-generation-ai": serviceUrl("content-generation-ai", "MCP_CONTENT_GENERATION_AI_URL"),
  "cto-agent": serviceUrl("cto-agent", "MCP_CTO_AGENT_URL"),
  "data-scrubbing-ai": serviceUrl("data-scrubbing-ai", "MCP_DATA_SCRUBBING_AI_URL"),
  "designer-ai-agent": serviceUrl("designer-ai-agent", "MCP_DESIGNER_AI_AGENT_URL"),
  "email-campaign-optimizer-ai": serviceUrl("email-campaign-optimizer-ai", "MCP_EMAIL_CAMPAIGN_OPTIMIZER_AI_URL"),
  "fundraising-chatbot-ai": serviceUrl("fundraising-chatbot-ai", "MCP_FUNDRAISING_CHATBOT_AI_URL"),
  "hr-ai-agent": serviceUrl("hr-ai-agent", "MCP_HR_AI_AGENT_URL"),
  "information-retrieval-ai": serviceUrl("information-retrieval-ai", "MCP_INFORMATION_RETRIEVAL_AI_URL"),
  "investment_recommendation": serviceUrl("investment_recommendation", "MCP_INVESTMENT_RECOMMENDATION_URL"),
  "mcp-analytics": serviceUrl("mcp-analytics", "MCP_MCP_ANALYTICS_URL"),
  "mcp-google-ads": serviceUrl("mcp-google-ads", "MCP_MCP_GOOGLE_ADS_URL"),
  "multimodal-ai": serviceUrl("multimodal-ai", "MCP_MULTIMODAL_AI_URL"),
  "org-scrubber-mcp": serviceUrl("org-scrubber-mcp", "MCP_ORG_SCRUBBER_MCP_URL"),
  "personalized-donation-ai": serviceUrl("personalized-donation-ai", "MCP_PERSONALIZED_DONATION_AI_URL"),
  "project-manager-agent": serviceUrl("project-manager-agent", "MCP_PROJECT_MANAGER_AGENT_URL"),
  "qa-ai-agent": serviceUrl("qa-ai-agent", "MCP_QA_AI_AGENT_URL"),
  "reporting-dashboard-ai": serviceUrl("reporting-dashboard-ai", "MCP_REPORTING_DASHBOARD_AI_URL"),
  "trade_execution_gateway": serviceUrl("trade_execution_gateway", "MCP_TRADE_EXECUTION_GATEWAY_URL"),
  "tradefinance_lc": serviceUrl("tradefinance_lc", "MCP_TRADEFINANCE_LC_URL"),
  "tradeops": serviceUrl("tradeops", "MCP_TRADEOPS_URL"),
  "training_to_sop": serviceUrl("training_to_sop", "MCP_TRAINING_TO_SOP_URL"),
  "treasury": serviceUrl("treasury", "MCP_TREASURY_URL"),
  [DOCUMENT_PROCESS_TOOL.tool]: serviceUrl(DOCUMENT_PROCESS_TOOL.service, "MCP_DOCUMENT_MANAGER_URL"),
};
