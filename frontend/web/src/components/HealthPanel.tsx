import { useHealthStatus } from "@/hooks/useHealthStatus";

export const HealthPanel = () => {
  const { authStatus, mcpStatus, featureFlags } = useHealthStatus();

  const statusBadge = (status: string) => {
    const color =
      status === "ok" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
    return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>;
  };

  return (
    <div className="border rounded-lg p-4 bg-card/50">
      <h3 className="text-sm font-semibold mb-3">System Health</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Auth</span>
          {statusBadge(authStatus)}
        </div>
        <div className="flex items-center justify-between">
          <span>MCP</span>
          {statusBadge(mcpStatus)}
        </div>
        <div className="flex items-center justify-between">
          <span>Feature Flags</span>
          <span className="text-xs text-muted-foreground">
            PWA: {featureFlags.pwa ? "on" : "off"} / AppCheck: {featureFlags.appCheck ? "on" : "off"}
          </span>
        </div>
      </div>
    </div>
  );
};
