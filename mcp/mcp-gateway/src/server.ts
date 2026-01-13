import express from 'express';
import { randomUUID } from 'crypto';
import { requireRole } from './auth/requireRole';
import type { VerifiedTokenClaims } from './auth/verifyFirebaseToken';
import { MCP_REGISTRY } from './mcp/registry';

type ExecutePayload = {
  toolId?: string;
  orgId?: string;
  input?: unknown;
  meta?: Record<string, unknown>;
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
  '/mcp/tools/:toolId',
  '/mcp/context',
];

const ALLOWED_ROLES = ['super_admin', 'org_admin', 'case_worker'];
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
    hasOrgClaim: Boolean(claims?.org),
  };
}

function resolveEffectiveOrg(
  claims: VerifiedTokenClaims,
  untrustedOrgId?: string
): { ok: true; org: string } | { ok: false; error: string } {
  if (!claims.org) {
    return { ok: false, error: 'Missing org claim' };
  }
  if (untrustedOrgId && claims.org !== untrustedOrgId) {
    return { ok: false, error: 'Org mismatch' };
  }
  return { ok: true, org: claims.org };
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
  requestId: string
) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader ?? '',
      'X-Request-Id': requestId,
    },
    body: JSON.stringify(payload ?? {}),
  });
  const bodyText = await resp.text();
  const contentType = resp.headers.get('content-type') ?? 'application/json';
  return { status: resp.status, bodyText, contentType };
}

app.post('/mcp/execute', async (req, res) => {
  const requestId = randomUUID();
  const authHeader = req.header('Authorization');
  const payload = req.body as ExecutePayload;
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
    const baseUrl = MCP_REGISTRY[toolId];
    if (!baseUrl) {
      status = 404;
      return res.status(status).json({ error: 'Unknown toolId', toolId });
    }
    const targetUrl = `${baseUrl}/execute`;
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
    const baseUrl = MCP_REGISTRY[toolId];
    if (!baseUrl) {
      status = 404;
      return res.status(status).json({ error: 'Unknown toolId', toolId });
    }
    const targetUrl = `${baseUrl}/mcp/tools/${toolId}`;
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
    const baseUrl = MCP_REGISTRY[toolId];
    if (!baseUrl) {
      status = 404;
      return res.status(status).json({ error: 'Unknown toolId', toolId });
    }
    const contextUrl = `${baseUrl}/context`;
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
