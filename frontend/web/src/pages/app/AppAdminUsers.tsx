import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppAdminUsers() {
  return (
    <AppShell title="Admin Users" subtitle="Manage platform users">
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          User management placeholder — connect to admin user list.
        </CardContent>
      </Card>
    </AppShell>
  );
}
