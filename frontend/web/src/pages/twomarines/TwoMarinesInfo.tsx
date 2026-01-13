import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    title: "Mission",
    body: "Support veterans by connecting them to trusted partners, verified programs, and accountable teams.",
  },
  {
    title: "How it works",
    body: "2Marines aligns people, platforms, and funding through approvals and clear program governance.",
  },
  {
    title: "Outcomes",
    body: "We track impact through audit-ready workflows and transparent reporting.",
  },
];

export default function TwoMarinesInfo() {
  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">About 2Marines</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          2Marines is a nonprofit hub that connects veterans to support programs
          while giving partners the operational clarity they need to deliver and
          measure outcomes.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardContent className="space-y-3 py-6">
                <h3 className="text-xl font-semibold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 max-w-3xl space-y-4 text-sm text-muted-foreground">
          <p>
            We work with nonprofits, businesses, and public agencies to ensure
            veteran support is coordinated, auditable, and delivered with care.
          </p>
          <p>
            ShieldMate provides the secure platform layer, while MarineCoin
            represents the impact credit concept for verified outcomes.
          </p>
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
