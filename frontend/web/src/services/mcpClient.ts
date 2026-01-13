import { getAppCheckToken } from "@/lib/firebase";
import { recordAudit } from "@/lib/audit";

type TokenResolver = (forceRefresh?: boolean) => Promise<string>;
type AppCheckResolver = () => Promise<string | null>;
type UidResolver = () => string | undefined;

export interface McpClientConfig {
  endpoint?: string;
  getIdToken: TokenResolver;
  getUid: UidResolver;
  getAppCheckToken?: AppCheckResolver;
}

export interface McpRequest {
  operation: string;
  payload?: Record<string, unknown>;
  orgId?: string | null;
}

const DEFAULT_TIMEOUT_MS = 20000;

const readEnv = (key: string): string | undefined => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
};

const normalizeEndpoint = (value?: string) => {
  const raw = value || readEnv("VITE_MCP_ENDPOINT") || readEnv("VITE_MCP_ENDPOINT_PROD");
  if (!raw) {
    throw new Error("MCP endpoint is not configured. Set VITE_MCP_ENDPOINT.");
  }
  const trimmed = raw.replace(/\/$/, "");
  if (trimmed.startsWith("http://")) {
    throw new Error("MCP endpoint must be served over HTTPS.");
  }
  if (trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    console.debug("Unable to parse MCP response body", error);
    return { raw: text };
  }
};

export const createMcpClient = (config: McpClientConfig) => {
  const endpoint = normalizeEndpoint(config.endpoint);

  const request = async (
    { operation, payload, orgId }: McpRequest,
    attempt = 0
  ): Promise<Record<string, unknown>> => {
    const uid = config.getUid();
    if (!uid) {
      throw new Error("User must be authenticated to call MCP.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const token = await config.getIdToken(attempt > 0);
      const appCheckToken = config.getAppCheckToken
        ? await config.getAppCheckToken()
        : await getAppCheckToken();

      recordAudit({ category: "mcp", action: operation, uid, orgId });

      // Cloud Run should validate:
      // 1) Authorization Bearer (Firebase ID token) via Admin SDK
      // 2) X-Firebase-AppCheck when present
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Id": uid,
          ...(orgId ? { "X-Org-Id": orgId } : {}),
          ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
        },
        body: JSON.stringify({
          operation,
          ...payload,
        }),
        signal: controller.signal,
      });

      const parsed = await parseJsonSafely(response);

      if (response.status === 401 && attempt === 0) {
        // Refresh token and retry once on auth failures
        recordAudit({ category: "mcp", action: `${operation}_unauthorized_retry`, uid, orgId });
        return request({ operation, payload, orgId }, attempt + 1);
      }

      if (!response.ok) {
        const message =
          (parsed as { message?: string }).message ||
          `MCP request ${operation} failed with status ${response.status}.`;
        recordAudit({
          category: "mcp",
          action: `${operation}_failed`,
          uid,
          orgId,
          error: message,
        });
        throw new Error(message);
      } else {
        recordAudit({ category: "mcp", action: `${operation}_ok`, uid, orgId });
      }

      return parsed as Record<string, unknown>;
    } finally {
      clearTimeout(timeout);
    }
  };

  return {
    request,
  };
};
