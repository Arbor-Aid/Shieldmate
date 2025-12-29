import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "What MarineCoin is",
    body: "MarineCoin is a loyalty and impact credit concept used to recognize verified veteran support actions.",
  },
  {
    title: "How it is used",
    body: "Credits align partners around shared outcomes and provide transparent reporting for stakeholders.",
  },
  {
    title: "Earning and redemption",
    body: "Credits are issued after approvals and can be redeemed for approved services or partner initiatives.",
  },
  {
    title: "Partner onboarding",
    body: "Partners participate through verified programs, clear onboarding steps, and compliance checks.",
  },
];

const complianceNotes = [
  "MarineCoin is a loyalty and impact credit concept.",
  "Not investment advice or a promise of profit.",
  "Availability is subject to program rules and approvals.",
  "Partner eligibility and program scope may change.",
];

export default function TwoMarinesMarineCoin() {
  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">MarineCoin Concepts</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          MarineCoin complements ShieldMate by creating a transparent impact
          credit layer for verified veteran support.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="space-y-3 py-6">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-border bg-card">
            <CardContent className="space-y-3 py-6">
              <h3 className="text-lg font-semibold">Compliance callout</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {complianceNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border border-secondary/40 bg-secondary/10">
            <CardContent className="flex h-full flex-col justify-between gap-4 py-6">
              <div>
                <h3 className="text-lg font-semibold">Explore MarineCoin</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Learn how impact credits align partners around verified
                  veteran support outcomes.
                </p>
              </div>
              <Button asChild>
                <a
                  href="https://marinecoin.2marines.us"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit the MarineCoin site
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
