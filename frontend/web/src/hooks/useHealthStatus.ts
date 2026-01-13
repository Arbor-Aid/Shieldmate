import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMcpClient } from "@/hooks/useMcpClient";

type Status = "ok" | "degraded" | "unknown";

export function useHealthStatus() {
  const { currentUser } = useAuth();
  const { fetchAnalytics } = useMcpClient({ analyticsOrgId: null });
  const [mcpStatus, setMcpStatus] = useState<Status>("unknown");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        await fetchAnalytics.refetch();
        if (!cancelled) setMcpStatus("ok");
      } catch {
        if (!cancelled) setMcpStatus("degraded");
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [fetchAnalytics]);

  const authStatus: Status = currentUser ? "ok" : "degraded";

  return {
    authStatus,
    mcpStatus,
    featureFlags: {
      pwa: true,
      appCheck: true,
    },
  };
}
