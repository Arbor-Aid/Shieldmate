import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function AppOrgIntake() {
  return (
    <AppShell title="Intake" subtitle="Review new veteran intake">
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Intake workflow placeholder — connect to approval queues.
        </CardContent>
      </Card>
    </AppShell>
  );
}
