import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { LetsWorkSection } from "@/components/ui/lets-work-section";

const featureCards = [
  {
    title: "Claims-first security",
    body: "Role and org access enforced by Firebase ID token claims with a super_admin override only.",
  },
  {
    title: "Approval-driven operations",
    body: "Every regulated action flows DRAFT → PENDING → APPROVED with audit trail.",
  },
  {
    title: "MCP gateway control plane",
    body: "All tool calls funnel through a single gateway with structured logging.",
  },
  {
    title: "Org-aware support workflows",
    body: "Keep partner orgs isolated while sharing verified outcomes.",
  },
];

export default function ShieldmateLanding() {
  return (
    <MarketingLayout>
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container mx-auto grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-foreground/80">
              ShieldMate
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground md:text-6xl">
              Mission-ready support operations for veterans and partners.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85">
              Orchestrate secure support workflows with claims-based RBAC,
              approvals, and an MCP gateway designed for audited outcomes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Launch ShieldMate
                </Button>
              </Link>
              <Link to="/app">
                <Button variant="outline" className="w-full sm:w-auto">
                  Enter the App
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-primary-foreground">
            <h3 className="text-xl font-semibold">Control Plane Snapshot</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
              <li>• Claims-only access (role/org)</li>
              <li>• Approval gates for regulated tools</li>
              <li>• Append-only audit ledger</li>
              <li>• MCP gateway as single ingress</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card) => (
            <Card key={card.title} className="bg-card/70">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {card.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Trusted by mission teams</h2>
            <p className="mt-3 text-muted-foreground">
              ShieldMate keeps operations human-first while giving leaders
              visibility into approvals, partners, and outcomes.
            </p>
          </div>
          <AnimatedTestimonials />
        </div>
      </section>

      <section className="container mx-auto pb-16">
        <LetsWorkSection />
      </section>
    </MarketingLayout>
  );
}
