import { Link } from "react-router-dom";
import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { LetsWorkSection } from "@/components/ui/lets-work-section";

const steps = [
  {
    title: "Verify support actions",
    body: "Partner orgs submit verified outcomes through approvals and audit trails.",
  },
  {
    title: "Issue MarineCoin credits",
    body: "Credits represent trusted impact, not speculation or investment.",
  },
  {
    title: "Redeem for services",
    body: "Credits fund approved veteran services and partner initiatives.",
  },
  {
    title: "Audit everything",
    body: "Every issuance and redemption is tracked with claims-only RBAC.",
  },
];

const useCases = [
  {
    title: "Veteran intake rewards",
    body: "Incentivize timely, verified onboarding and follow-through.",
  },
  {
    title: "Partner collaboration",
    body: "Track shared impact across partner organizations securely.",
  },
  {
    title: "Program milestones",
    body: "Tie credit issuance to tangible support milestones.",
  },
  {
    title: "Transparency reporting",
    body: "Provide donors and stakeholders with auditable summaries.",
  },
];

export default function MarineCoinLanding() {
  return (
    <MarineCoinLayout>
      <section className="marinecoin-hero py-16 text-primary-foreground md:py-24">
        <div className="container mx-auto grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-foreground/80">
              MarineCoin
            </p>
            <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
              Impact credits for verified veteran support.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85">
              MarineCoin is a mission-aligned credit system that rewards real
              outcomes, verified through ShieldMate approvals and audits.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/marinecoin/waitlist">
                <Button variant="secondary">Join Waitlist</Button>
              </Link>
              <Link to="/marinecoin/partners/apply">
                <Button variant="outline">Partner with us</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
            <h3 className="text-lg font-semibold">Built for compliance</h3>
            <ul className="mt-4 space-y-2 pl-5 text-sm text-primary-foreground/85 list-disc">
              <li>Claims-only RBAC</li>
              <li>Approval gates for issuance</li>
              <li>Audit trail on every action</li>
              <li>Partner org isolation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">How MarineCoin works</h2>
          <p className="mt-3 text-muted-foreground">
            MarineCoin is not a speculative asset. It is a verified credit tied
            to real-world outcomes and governed through approvals.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {step.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">Use cases</h2>
          <p className="mt-3 text-muted-foreground">
            Designed for veteran services, partner coordination, and donor
            transparency.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase) => (
            <Card key={useCase.title}>
              <CardHeader>
                <CardTitle>{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {useCase.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Voices from the field</h2>
            <p className="mt-3 text-muted-foreground">
              MarineCoin brings clarity to impact reporting without sacrificing
              human review.
            </p>
          </div>
          <AnimatedTestimonials />
        </div>
      </section>

      <section className="container mx-auto pb-16">
        <LetsWorkSection />
      </section>
    </MarineCoinLayout>
  );
}
