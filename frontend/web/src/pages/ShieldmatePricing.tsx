import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Partner",
    price: "Custom",
    description: "For partner orgs onboarding their first cohorts.",
    highlights: ["Org RBAC", "Audit logs", "Approval workflows"],
  },
  {
    name: "Command",
    price: "Custom",
    description: "Multi-org deployments with dedicated support.",
    highlights: ["MCP gateway", "Integrations", "Priority SLAs"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced governance, private MCP services, edge agents.",
    highlights: ["Private Cloud Run", "Custom agents", "Security reviews"],
  },
];

export default function ShieldmatePricing() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold">Pricing</h1>
          <p className="mt-4 text-muted-foreground">
            ShieldMate is mission-aligned. We tailor pricing to nonprofit and
            partner needs.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className="flex flex-col">
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-2xl font-semibold">{tier.price}</p>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {tier.highlights.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <Button className="mt-auto">Talk to us</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
