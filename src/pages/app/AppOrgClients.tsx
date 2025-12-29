import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppOrgClients() {
  return (
    <AppShell title="Clients" subtitle="Veterans assigned to your org">
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Client list placeholder — integrate with org-scoped data sources.
        </CardContent>
      </Card>
    </AppShell>
  );
}
