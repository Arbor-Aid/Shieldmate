import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppOrgReports() {
  return (
    <AppShell title="Org Reports" subtitle="Track outcomes and approvals">
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Reports placeholder — integrate analytics and audit summaries.
        </CardContent>
      </Card>
    </AppShell>
  );
}
