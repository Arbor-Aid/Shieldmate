import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppOrgDashboard() {
  return (
    <AppShell title="Org Dashboard" subtitle="Overview for partner staff">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Intake Queue</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Review new veteran intake requests and route next steps.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Org Reports</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Monitor workload and approvals in one view.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Track submitted files and required documents.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
