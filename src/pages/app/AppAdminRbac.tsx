import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppAdminRbac() {
  return (
    <AppShell title="RBAC" subtitle="Role-based access controls">
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          RBAC management lives in the admin control plane.
          <div className="mt-3">
            <Link to="/admin/rbac" className="text-primary underline">
              Open RBAC admin
            </Link>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
