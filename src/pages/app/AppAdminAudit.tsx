import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { submitUiuxAudit } from "@/services/uiuxAudit";
import { useRoleAuth } from "@/hooks/useRoleAuth";

export default function AppAdminAudit() {
  const { userRole } = useRoleAuth();
  const [status, setStatus] = useState<string | null>(null);

  const handleRunAudit = async () => {
    setStatus("Running audit...");
    try {
      const result = await submitUiuxAudit({
        route: "/app/admin/audit",
        userRole: userRole ?? "unknown",
        timestamp: new Date().toISOString(),
        componentList: ["Navbar", "AppShell", "RunUxAuditButton"],
      });
      setStatus(result.ok ? "MCP audit sent" : `Audit failed: ${result.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Audit failed");
    }
  };

  return (
    <AppShell title="UX Audit" subtitle="Run UI/UX verification checks">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Use this to send a non-sensitive audit payload to the UI/UX MCP.
        </p>
        <Button className="mt-4" onClick={handleRunAudit}>
          Run UX Audit
        </Button>
        {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
      </div>
    </AppShell>
  );
}
