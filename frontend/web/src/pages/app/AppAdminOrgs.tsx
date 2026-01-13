import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppAdminOrgs() {
  return (
    <AppShell title="Admin Orgs" subtitle="Org oversight and governance">
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Organization management placeholder — integrate org directory.
        </CardContent>
      </Card>
    </AppShell>
  );
}
