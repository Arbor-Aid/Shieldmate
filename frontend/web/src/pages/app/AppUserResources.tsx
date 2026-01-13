import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const resources = [
  { title: "Housing Assistance", body: "Find vetted housing partners." },
  { title: "Career Coaching", body: "Access resume and interview support." },
  { title: "Health Services", body: "Connect to wellness providers." },
];

export default function AppUserResources() {
  return (
    <AppShell title="Resources" subtitle="Recommended support resources">
      <div className="grid gap-6 md:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.title}>
            <CardHeader>
              <CardTitle>{resource.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {resource.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
