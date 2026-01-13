import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Submit support actions",
    body: "Partner orgs submit verified veteran support actions through ShieldMate.",
  },
  {
    title: "Review and approve",
    body: "Approvals move through draft, review, and approval states.",
  },
  {
    title: "Issue credits",
    body: "MarineCoin credits are issued once actions are approved.",
  },
  {
    title: "Redeem for impact",
    body: "Credits unlock services, partner resources, and documented outcomes.",
  },
  {
    title: "Audit and report",
    body: "Every action is logged, searchable, and ready for compliance reviews.",
  },
];

export default function MarineCoinHowItWorks() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">How it works</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          MarineCoin uses the ShieldMate approval pipeline to validate impact
          before credits are issued.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle>
                  {index + 1}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {step.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarineCoinLayout>
  );
}
