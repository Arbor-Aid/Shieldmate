import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppAdminDashboard() {
  return (
    <AppShell title="Admin Dashboard" subtitle="Operations overview">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Access the full admin dashboard and approvals workspace.
            <div className="mt-3">
              <Link to="/admin" className="text-primary underline">
                Open admin dashboard
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Review audit logs, roles, and MCP health from the admin suite.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
