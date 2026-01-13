import { Link } from "react-router-dom";
import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const partnerTiers = [
  {
    title: "Community Partners",
    body: "Local orgs participating in verified support actions.",
  },
  {
    title: "Regional Hubs",
    body: "Multi-org coordination with shared outcome reporting.",
  },
  {
    title: "Strategic Allies",
    body: "Enterprise sponsors supporting measurable veteran outcomes.",
  },
];

export default function MarineCoinPartners() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Partners</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          MarineCoin connects partner organizations through secure, verified
          impact credits.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {partnerTiers.map((tier) => (
            <Card key={tier.title}>
              <CardHeader>
                <CardTitle>{tier.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {tier.body}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/marinecoin/partners/apply">
            <Button>Apply as a partner</Button>
          </Link>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
