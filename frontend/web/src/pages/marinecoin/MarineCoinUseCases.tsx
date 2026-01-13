import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const useCases = [
  {
    title: "Rapid intake completion",
    description: "Reward orgs that complete verified veteran intake workflows.",
  },
  {
    title: "Critical resource delivery",
    description: "Track delivery of housing, medical, and employment resources.",
  },
  {
    title: "Partner referrals",
    description: "Recognize partners who close verified referral loops.",
  },
  {
    title: "Outcome reporting",
    description: "Provide donors with verified, auditable impact metrics.",
  },
  {
    title: "Community initiatives",
    description: "Support localized programs with transparent credit issuance.",
  },
  {
    title: "Training incentives",
    description: "Encourage org staff to complete compliance training on time.",
  },
];

export default function MarineCoinUseCases() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Use cases</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          MarineCoin connects verified actions to measurable outcomes across
          partner organizations.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarineCoinLayout>
  );
}
