type HealthCheckResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
  raw: string;
};

const readEnv = (key: string): string | undefined => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
};

const normalizeGateway = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.replace(/\/$/, "");
  return trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
};

const resolveGatewayEndpoint = () => {
  return normalizeGateway(
    readEnv("VITE_MCP_GATEWAY") || readEnv("VITE_MCP_ENDPOINT")
  );
};

export async function testGatewayHealth(): Promise<HealthCheckResult> {
  const endpoint = resolveGatewayEndpoint();
  if (!endpoint) {
    throw new Error("Gateway endpoint not configured.");
  }

  const response = await fetch(`${endpoint}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const raw = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    raw,
  };
}
