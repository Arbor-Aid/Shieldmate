import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { CookieMissionPet } from "@/components/admin/CookieMissionPet";
import {
  CookieMissionReport,
  getCookieHealthPresentation,
} from "@/components/admin/cookieMissionState";
import { testGatewayHealth } from "@/services/mcpGateway";

const cookieReports: readonly CookieMissionReport[] = [
  {
    responsibility: "Security Watchdog",
    status: "awaiting-approval",
    summary: "Gateway security tests passed; Firebase staging validation remains pending.",
    evidenceLabel: "Owner-supplied October 15 checkpoint",
    evidence: "Gateway commit e2179f9; deployment approval required.",
  },
  {
    responsibility: "Task Companion",
    status: "in-progress",
    summary: "Gateway security is completed; COOKIE is in progress; deployment awaits approval.",
    evidenceLabel: "Owner-supplied task status",
    evidence: "No blocked item reported. COOKIE does not change authoritative status.",
  },
  {
    responsibility: "Continuity Guardian",
    status: "completed",
    summary: "Verified milestones are preserved without combining the active workstreams.",
    evidenceLabel: "Owner-supplied continuity checkpoint",
    evidence:
      "43 Cloud Run entries previously verified; Business Pipeline 43/43 local tests passed; COOKIE remains separate.",
  },
];

export default function AppAdminMcpHealth() {
  const [status, setStatus] = useState<string | null>(null);
  const [cookie, setCookie] = useState(() => getCookieHealthPresentation({ kind: "idle" }));

  const handleTest = async () => {
    setStatus("Checking MCP gateway...");
    setCookie(getCookieHealthPresentation({ kind: "checking" }));
    try {
      const result = await testGatewayHealth();
      if (result.ok) {
        setStatus("MCP reachable");
        setCookie(getCookieHealthPresentation({ kind: "success", status: result.status }));
      } else {
        setStatus(`MCP returned ${result.status}`);
        setCookie(getCookieHealthPresentation({ kind: "warning", status: result.status }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "MCP check failed";
      setStatus(message);
      setCookie(
        getCookieHealthPresentation({
          kind: message === "Gateway endpoint not configured." ? "missing-data" : "failure",
        })
      );
    }
  };

  return (
    <AppShell title="MCP Health" subtitle="Gateway connectivity checks">
      <div className="space-y-4">
        <CookieMissionPet {...cookie} reports={cookieReports} />
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            This health check only calls the gateway /health endpoint.
          </p>
          <Button className="mt-4" onClick={handleTest}>
            Test MCP Connection
          </Button>
          {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
        </div>
      </div>
    </AppShell>
  );
}
