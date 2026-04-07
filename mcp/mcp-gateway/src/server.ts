import express from 'express';
import { randomUUID } from 'crypto';
import { requireRole } from './auth/requireRole';
import type { VerifiedTokenClaims } from './auth/verifyFirebaseToken';
import { REQUIRED_TOOL_ROUTES, resolveRegistryTarget } from './mcp/registry';

type ExecutePayload = {
  toolId?: string;
  tool?: string;
  orgId?: string;
  input?: unknown;
  meta?: Record<string, unknown>;
  traceId?: string;
};

type ContextPayload = {
  toolId?: string;
  orgId?: string;
  input?: unknown;
  meta?: Record<string, unknown>;
};

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 8080;
const VERSION = process.env.GIT_SHA || process.env.K_REVISION || 'unknown';
const SERVICE_NAME = process.env.SERVICE_NAME || 'mcp-gateway';
const SERVICE_SLUG = process.env.SERVICE_SLUG || 'mcp-gateway';
const SERVICE_DESCRIPTION =
  process.env.SERVICE_DESCRIPTION ||
  'Gateway routing MCP requests with RBAC enforcement and registry-based dispatch.';
const SERVICE_VERSION = process.env.SERVICE_VERSION || VERSION;
const ENV_VARS_REQUIRED = [
  'PORT',
  'SERVICE_NAME',
  'SERVICE_SLUG',
  'SERVICE_VERSION',
  'SERVICE_DESCRIPTION',
  'LOG_LEVEL',
  'GIT_SHA',
  'K_REVISION',
];
const ROUTES = [
  '/health',
  '/meta',
  '/version',
  '/mcp/execute',
  '/execute',
  '/mcp/tools/:toolId',
  '/mcp/context',
];

const ALLOWED_ROLES = ['super_admin', 'org_admin', 'staff', 'case_worker'];
const CAPABILITIES = ['gateway_proxy', 'rbac_enforced', 'mcp_registry_routing'];
const INPUTS = ['toolId', 'orgId', 'input', 'meta'];
const OUTPUTS = ['upstream_response'];

function logEvent(entry: Record<string, unknown>) {
  console.log(JSON.stringify(entry));
}

function getRequestMeta(req: express.Request, claims?: VerifiedTokenClaims | null) {
  return {
    method: req.method,
    path: req.path,
    hasAuth: Boolean(req.header('Authorization')),
    hasAppCheck: Boolean(req.header('X-Firebase-AppCheck')),
    hasOrgClaim: Boolean(claims?.orgId || claims?.org),
  };
}

function resolveEffectiveOrg(
  claims: VerifiedTokenClaims,
  untrustedOrgId?: string
): { ok: true; org: string } | { ok: false; error: string } {
  const claimOrg = claims.orgId ?? claims.org;
  const claimOrgSet = new Set<string>();
  if (claimOrg) {
    claimOrgSet.add(claimOrg);
  }
  Object.keys(claims.orgRoles ?? {}).forEach((orgId) => {
    if (orgId) {
      claimOrgSet.add(orgId);
    }
  });
  if (claimOrgSet.size === 0) {
    return { ok: false, error: 'Missing org claim' };
  }
  if (untrustedOrgId) {
    if (!claimOrgSet.has(untrustedOrgId)) {
      return { ok: false, error: 'Org mismatch' };
    }
    return { ok: true, org: untrustedOrgId };
  }
  return { ok: true, org: Array.from(claimOrgSet)[0] };
}

app.get('/health', (req, res) => {
  logEvent({
    requestId: randomUUID(),
    ...getRequestMeta(req),
    status: 200,
  });
  res.status(200).json({
    status: 'ok',
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    time: new Date().toISOString(),
  });
});

app.get('/meta', (req, res) => {
  logEvent({
    requestId: randomUUID(),
    ...getRequestMeta(req),
    status: 200,
  });
  res.status(200).json({
    name: SERVICE_NAME,
    slug: SERVICE_SLUG,
    description: SERVICE_DESCRIPTION,
    routes: ROUTES,
    env_vars_required: ENV_VARS_REQUIRED,
    supports: {
      tools: CAPABILITIES,
      data: [],
    },
    build: {
      runtime: 'node',
      node: process.version,
    },
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    capabilities: CAPABILITIES,
    inputs: INPUTS,
    outputs: OUTPUTS,
  });
});

app.get('/version', (req, res) => {
  logEvent({
    requestId: randomUUID(),
    ...getRequestMeta(req),
    status: 200,
  });
  res.status(200).json({ version: VERSION });
});

async function proxyPost(
  url: string,
  payload: unknown,
  authHeader: string | undefined,
  traceId: string
) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader ?? '',
      'X-Request-Id': traceId,
      'X-Trace-Id': traceId,
    },
    body: JSON.stringify(payload ?? {}),
  });
  const bodyText = await resp.text();
  const contentType = resp.headers.get('content-type') ?? 'application/json';
  return { status: resp.status, bodyText, contentType };
}

function firstNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeToolIdentifier(payload: ExecutePayload | null | undefined): {
  normalizedToolId?: string;
  originalToolFieldPresent: boolean;
  originalToolIdFieldPresent: boolean;
} {
  const source = payload ?? {};
  const originalToolFieldPresent = Object.prototype.hasOwnProperty.call(source, 'tool');
  const originalToolIdFieldPresent = Object.prototype.hasOwnProperty.call(source, 'toolId');
  const normalizedToolId =
    firstNonEmptyString(source.toolId) ?? firstNonEmptyString(source.tool);
  return {
    normalizedToolId,
    originalToolFieldPresent,
    originalToolIdFieldPresent,
  };
}

async function handleExecute(req: express.Request, res: express.Response) {
  const requestId = randomUUID();
  const inboundTraceId = req.header('X-Trace-Id') ?? req.header('X-Request-Id') ?? undefined;
  const traceId = inboundTraceId ?? requestId;
  const authHeader = req.header('Authorization');
  const payload = req.body as ExecutePayload;
  const untrustedOrgId = payload?.orgId;
  const normalizedTool = normalizeToolIdentifier(payload);
  const toolId = normalizedTool.normalizedToolId;
  let claims: VerifiedTokenClaims | null = null;
  let routedService: string | null = null;
  let targetUrl: string | null = null;
  let status = 200;
  try {
    if (!toolId) {
      status = 400;
      return res.status(status).json({
        error: 'toolId is required (legacy alias: tool)',
        normalizedToolId: null,
        originalToolFieldPresent: normalizedTool.originalToolFieldPresent,
        originalToolIdFieldPresent: normalizedTool.originalToolIdFieldPresent,
        authorizationPresent: Boolean(authHeader),
        traceId,
      });
    }
    claims = await requireRole(authHeader, ALLOWED_ROLES);
    const resolvedOrg = resolveEffectiveOrg(claims, untrustedOrgId);
    if (!resolvedOrg.ok) {
      status = 403;
      return res.status(status).json({
        error: resolvedOrg.error,
        normalizedToolId: toolId,
        originalToolFieldPresent: normalizedTool.originalToolFieldPresent,
        originalToolIdFieldPresent: normalizedTool.originalToolIdFieldPresent,
        authorizationPresent: Boolean(authHeader),
        traceId,
      });
    }
    const target = resolveRegistryTarget(toolId);
    if (!target) {
      status = 404;
      return res.status(status).json({
        error: 'Unknown toolId',
        toolId,
        knownToolRoutes: REQUIRED_TOOL_ROUTES,
        normalizedToolId: toolId,
        originalToolFieldPresent: normalizedTool.originalToolFieldPresent,
        originalToolIdFieldPresent: normalizedTool.originalToolIdFieldPresent,
        routedService: null,
        targetUrl: null,
        authorizationPresent: Boolean(authHeader),
        traceId,
      });
    }
    routedService = target.service;
    targetUrl = target.targetUrl;
    const upstreamPayload = {
      ...payload,
      toolId,
      tool: toolId,
      orgId: resolvedOrg.org,
      traceId,
    };
    const upstream = await proxyPost(target.targetUrl, upstreamPayload, authHeader, traceId);
    status = upstream.status;
    if (status === 404) {
      return res.status(502).json({
        error: 'MCP route not implemented for toolId/service; update registry/proxy mapping',
        toolId,
        routedService: target.service,
        targetUrl: target.targetUrl,
        normalizedToolId: toolId,
        originalToolFieldPresent: normalizedTool.originalToolFieldPresent,
        originalToolIdFieldPresent: normalizedTool.originalToolIdFieldPresent,
        authorizationPresent: Boolean(authHeader),
        traceId,
      });
    }
    res.status(status).type(upstream.contentType).send(upstream.bodyText);
  } catch (err) {
    status = 403;
    res.status(status).json({
      error: 'Forbidden',
      normalizedToolId: toolId ?? null,
      originalToolFieldPresent: normalizedTool.originalToolFieldPresent,
      originalToolIdFieldPresent: normalizedTool.originalToolIdFieldPresent,
      routedService,
      targetUrl,
      authorizationPresent: Boolean(authHeader),
      traceId,
    });
  } finally {
    logEvent({
      requestId,
      traceId,
      ...getRequestMeta(req, claims),
      normalizedToolId: toolId ?? null,
      originalToolFieldPresent: normalizedTool.originalToolFieldPresent,
      originalToolIdFieldPresent: normalizedTool.originalToolIdFieldPresent,
      routedService,
      targetUrl,
      authorizationPresent: Boolean(authHeader),
      status,
    });
  }
}

app.post('/mcp/execute', handleExecute);
app.post('/execute', handleExecute);

app.post('/mcp/tools/:toolId', async (req, res) => {
  const requestId = randomUUID();
  const authHeader = req.header('Authorization');
  const toolId = req.params.toolId;
  const payload = req.body as ExecutePayload;
  const untrustedOrgId = payload?.orgId;
  let claims: VerifiedTokenClaims | null = null;
  let status = 200;
  try {
    if (!toolId) {
      status = 400;
      return res.status(status).json({ error: 'toolId is required' });
    }
    claims = await requireRole(authHeader, ALLOWED_ROLES);
    const resolvedOrg = resolveEffectiveOrg(claims, untrustedOrgId);
    if (!resolvedOrg.ok) {
      status = 403;
      return res.status(status).json({ error: resolvedOrg.error });
    }
    const target = resolveRegistryTarget(toolId);
    if (!target) {
      status = 404;
      return res.status(status).json({
        error: 'Unknown toolId',
        toolId,
        knownToolRoutes: REQUIRED_TOOL_ROUTES,
      });
    }
    const targetUrl = `${target.baseUrl}/mcp/tools/${toolId}`;
    const upstreamPayload = {
      ...payload,
      orgId: resolvedOrg.org,
    };
    const upstream = await proxyPost(targetUrl, upstreamPayload, authHeader, requestId);
    status = upstream.status;
    if (status === 404) {
      return res.status(502).json({
        error: 'MCP route not implemented for toolId/service; update registry/proxy mapping',
        toolId,
        routedService: target.service,
        targetUrl,
      });
    }
    res.status(status).type(upstream.contentType).send(upstream.bodyText);
  } catch (err) {
    status = 403;
    res.status(status).json({ error: 'Forbidden' });
  } finally {
    logEvent({
      requestId,
      ...getRequestMeta(req, claims),
      status,
    });
  }
});

app.post('/mcp/context', async (req, res) => {
  const requestId = randomUUID();
  const authHeader = req.header('Authorization');
  const payload = req.body as ContextPayload;
  const toolId = payload?.toolId;
  const untrustedOrgId = payload?.orgId;
  let claims: VerifiedTokenClaims | null = null;
  let status = 200;
  try {
    if (!toolId) {
      status = 400;
      return res.status(status).json({ error: 'toolId is required' });
    }
    claims = await requireRole(authHeader, ALLOWED_ROLES);
    const resolvedOrg = resolveEffectiveOrg(claims, untrustedOrgId);
    if (!resolvedOrg.ok) {
      status = 403;
      return res.status(status).json({ error: resolvedOrg.error });
    }
    const target = resolveRegistryTarget(toolId);
    if (!target) {
      status = 404;
      return res.status(status).json({
        error: 'Unknown toolId',
        toolId,
        knownToolRoutes: REQUIRED_TOOL_ROUTES,
      });
    }
    const contextUrl = `${target.baseUrl}/context`;
    const upstreamPayload = {
      ...payload,
      orgId: resolvedOrg.org,
    };
    const upstream = await proxyPost(contextUrl, upstreamPayload, authHeader, requestId);
    status = upstream.status;
    if (status === 404) {
      return res.status(502).json({
        error: 'MCP context route not implemented; update gateway mapping',
        toolId,
        routedService: target.service,
        targetUrl: contextUrl,
      });
    }
    res.status(status).type(upstream.contentType).send(upstream.bodyText);
  } catch (err) {
    status = 403;
    res.status(status).json({ error: 'Forbidden' });
  } finally {
    logEvent({
      requestId,
      ...getRequestMeta(req, claims),
      status,
    });
  }
});

app.listen(PORT, () => {
  console.log(JSON.stringify({ service: 'mcp-gateway', status: 'listening', port: PORT }));
});
