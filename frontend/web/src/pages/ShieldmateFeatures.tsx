import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Claims-only RBAC",
    description:
      "All privileged actions require Firebase ID token claims. No email trust.",
  },
  {
    title: "Approval workflows",
    description:
      "Regulated actions move through draft, review, and execution states.",
  },
  {
    title: "MCP gateway routing",
    description:
      "Centralized routing, logging, and tool execution via Cloud Run.",
  },
  {
    title: "Org isolation",
    description: "Data access remains scoped to org claims by default.",
  },
  {
    title: "Audit-ready by design",
    description:
      "Append-only logs capture actor, action, org, and outcome.",
  },
  {
    title: "Edge-ready workflows",
    description:
      "Built for distributed agents and Raspberry Pi execution paths.",
  },
];

export default function ShieldmateFeatures() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold">Features</h1>
          <p className="mt-4 text-muted-foreground">
            ShieldMate combines secure operations, partner workflows, and MCP
            orchestration into a single control plane.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
