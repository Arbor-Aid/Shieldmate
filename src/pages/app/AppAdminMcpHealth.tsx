import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { testGatewayHealth } from "@/services/mcpGateway";

export default function AppAdminMcpHealth() {
  const [status, setStatus] = useState<string | null>(null);

  const handleTest = async () => {
    setStatus("Checking MCP gateway...");
    try {
      const result = await testGatewayHealth();
      if (result.ok) {
        setStatus("MCP reachable");
      } else {
        setStatus(`MCP returned ${result.status}`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "MCP check failed");
    }
  };

  return (
    <AppShell title="MCP Health" subtitle="Gateway connectivity checks">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          This health check only calls the gateway /health endpoint.
        </p>
        <Button className="mt-4" onClick={handleTest}>
          Test MCP Connection
        </Button>
        {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
      </div>
    </AppShell>
  );
}
