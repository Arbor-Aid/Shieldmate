const CLOUD_RUN_DOMAIN = 'yd7bwat7eq-uc.a.run.app';
const USE_LOCALHOST = process.env.MCP_USE_LOCALHOST === 'true';
const LOCALHOST_BASE_URL = process.env.MCP_LOCALHOST_BASE_URL || 'http://localhost:8080';

export type RegistryRouteKind = 'service' | 'tool';

export type RegistryRouteDefinition = {
  key: string;
  service: string;
  envVar: string;
  path: '/execute';
  kind: RegistryRouteKind;
};

function defaultServiceUrl(slug: string): string {
  if (USE_LOCALHOST) {
    return LOCALHOST_BASE_URL;
  }
  return `https://${slug}-${CLOUD_RUN_DOMAIN}`;
}

function serviceUrl(slug: string, envVar: string): string {
  return process.env[envVar] || defaultServiceUrl(slug);
}

function route(
  key: string,
  service: string,
  envVar: string,
  kind: RegistryRouteKind
): RegistryRouteDefinition {
  return {
    key,
    service,
    envVar,
    path: '/execute',
    kind,
  };
}

const SERVICE_ROUTES: RegistryRouteDefinition[] = [
  route('ai-budget-planner', 'ai-budget-planner', 'MCP_AI_BUDGET_PLANNER_URL', 'service'),
  route('ai-expense-manager', 'ai-expense-manager', 'MCP_AI_EXPENSE_MANAGER_URL', 'service'),
  route('ai-financial-analyst', 'ai-financial-analyst', 'MCP_AI_FINANCIAL_ANALYST_URL', 'service'),
  route('ai-financial-reporting-specialist', 'ai-financial-reporting-specialist', 'MCP_AI_FINANCIAL_REPORTING_SPECIALIST_URL', 'service'),
  route('ai-invoice-processor', 'ai-invoice-processor', 'MCP_AI_INVOICE_PROCESSOR_URL', 'service'),
  route('ai-payroll-manager', 'ai-payroll-manager', 'MCP_AI_PAYROLL_MANAGER_URL', 'service'),
  route('ai-tax-compliance-agent', 'ai-tax-compliance-agent', 'MCP_AI_TAX_COMPLIANCE_AGENT_URL', 'service'),
  route('ai-training-coordinator', 'ai-training-coordinator', 'MCP_AI_TRAINING_COORDINATOR_URL', 'service'),
  route('ai-ux-analyst', 'ai-ux-analyst', 'MCP_AI_UX_ANALYST_URL', 'service'),
  route('amazon-drop-shipping-ai', 'amazon-drop-shipping-ai', 'MCP_AMAZON_DROP_SHIPPING_AI_URL', 'service'),
  route('coder-agent', 'coder-agent', 'MCP_CODER_AGENT_URL', 'service'),
  route('content-generation-ai', 'content-generation-ai', 'MCP_CONTENT_GENERATION_AI_URL', 'service'),
  route('cto-agent', 'cto-agent', 'MCP_CTO_AGENT_URL', 'service'),
  route('data-scrubbing-ai', 'data-scrubbing-ai', 'MCP_DATA_SCRUBBING_AI_URL', 'service'),
  route('designer-ai-agent', 'designer-ai-agent', 'MCP_DESIGNER_AI_AGENT_URL', 'service'),
  route('document-manager', 'document-manager', 'MCP_DOCUMENT_MANAGER_URL', 'service'),
  route('email-campaign-optimizer-ai', 'email-campaign-optimizer-ai', 'MCP_EMAIL_CAMPAIGN_OPTIMIZER_AI_URL', 'service'),
  route('fundraising-chatbot-ai', 'fundraising-chatbot-ai', 'MCP_FUNDRAISING_CHATBOT_AI_URL', 'service'),
  route('hr-ai-agent', 'hr-ai-agent', 'MCP_HR_AI_AGENT_URL', 'service'),
  route('information-retrieval-ai', 'information-retrieval-ai', 'MCP_INFORMATION_RETRIEVAL_AI_URL', 'service'),
  route('investment_recommendation', 'investment_recommendation', 'MCP_INVESTMENT_RECOMMENDATION_URL', 'service'),
  route('mcp-analytics', 'mcp-analytics', 'MCP_MCP_ANALYTICS_URL', 'service'),
  route('mcp-google-ads', 'mcp-google-ads', 'MCP_MCP_GOOGLE_ADS_URL', 'service'),
  route('multimodal-ai', 'multimodal-ai', 'MCP_MULTIMODAL_AI_URL', 'service'),
  route('org-scrubber-mcp', 'org-scrubber-mcp', 'MCP_ORG_SCRUBBER_MCP_URL', 'service'),
  route('personalized-donation-ai', 'personalized-donation-ai', 'MCP_PERSONALIZED_DONATION_AI_URL', 'service'),
  route('project-manager-agent', 'project-manager-agent', 'MCP_PROJECT_MANAGER_AGENT_URL', 'service'),
  route('qa-ai-agent', 'qa-ai-agent', 'MCP_QA_AI_AGENT_URL', 'service'),
  route('reporting-dashboard-ai', 'reporting-dashboard-ai', 'MCP_REPORTING_DASHBOARD_AI_URL', 'service'),
  route('trade_execution_gateway', 'trade_execution_gateway', 'MCP_TRADE_EXECUTION_GATEWAY_URL', 'service'),
  route('tradefinance_lc', 'tradefinance_lc', 'MCP_TRADEFINANCE_LC_URL', 'service'),
  route('tradeops', 'tradeops', 'MCP_TRADEOPS_URL', 'service'),
  route('training_to_sop', 'training_to_sop', 'MCP_TRAINING_TO_SOP_URL', 'service'),
  route('treasury', 'treasury', 'MCP_TREASURY_URL', 'service'),
];

const TOOL_ROUTES: RegistryRouteDefinition[] = [
  route('document.process', 'document-manager', 'MCP_DOCUMENT_MANAGER_URL', 'tool'),
  route('analytics.process', 'mcp-analytics', 'MCP_MCP_ANALYTICS_URL', 'tool'),
  route('project.update', 'project-manager-agent', 'MCP_PROJECT_MANAGER_AGENT_URL', 'tool'),
  route('training.sync', 'ai-training-coordinator', 'MCP_AI_TRAINING_COORDINATOR_URL', 'tool'),
  route('data.validate', 'data-scrubbing-ai', 'MCP_DATA_SCRUBBING_AI_URL', 'tool'),
];

const CONNECTIVITY_TOOL_ROUTES: RegistryRouteDefinition[] = SERVICE_ROUTES.map((entry) =>
  route(`${entry.service}.status`, entry.service, entry.envVar, 'tool')
);

const ROUTES: RegistryRouteDefinition[] = [
  ...SERVICE_ROUTES,
  ...TOOL_ROUTES,
  ...CONNECTIVITY_TOOL_ROUTES,
];

export const MCP_ROUTE_REGISTRY: Record<string, RegistryRouteDefinition> = Object.fromEntries(
  ROUTES.map((entry) => [entry.key, entry])
);

export const MCP_REGISTRY: Record<string, string> = Object.fromEntries(
  ROUTES.map((entry) => [entry.key, serviceUrl(entry.service, entry.envVar)])
);

export const REQUIRED_TOOL_ROUTES = [...TOOL_ROUTES, ...CONNECTIVITY_TOOL_ROUTES].map(
  (entry) => entry.key
);

export function resolveRegistryTarget(key: string): {
  key: string;
  service: string;
  path: string;
  kind: RegistryRouteKind;
  baseUrl: string;
  targetUrl: string;
} | null {
  const route = MCP_ROUTE_REGISTRY[key];
  if (!route) {
    return null;
  }
  const baseUrl = MCP_REGISTRY[key];
  return {
    key,
    service: route.service,
    path: route.path,
    kind: route.kind,
    baseUrl,
    targetUrl: `${baseUrl}${route.path}`,
  };
}
