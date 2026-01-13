import { Link } from "react-router-dom";
import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Veteran-first support",
    body: "Connect veterans with verified programs, partners, and human support teams.",
  },
  {
    title: "Operational clarity",
    body: "Keep outcomes visible with approvals, audit trails, and clear partner roles.",
  },
  {
    title: "Partner alignment",
    body: "Coordinate nonprofits, businesses, and community partners under shared goals.",
  },
];

const quickLinks = [
  {
    title: "ShieldMate",
    body: "The secure operations platform for veteran support workflows.",
    href: "https://shieldmate.2marines.us",
    cta: "Visit ShieldMate",
  },
  {
    title: "MarineCoin",
    body: "Impact credit concept for verified support actions.",
    href: "https://marinecoin.2marines.us",
    cta: "Explore MarineCoin",
  },
  {
    title: "Partnerships",
    body: "Join as a nonprofit, business, or government partner.",
    href: "/partnerships",
    cta: "Partner with 2Marines",
  },
];

export default function TwoMarinesHome() {
  const isExternal = (href: string) => href.startsWith("http");

  return (
    <TwoMarinesLayout>
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container mx-auto grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <Badge variant="secondary">2Marines Hub</Badge>
            <h1 className="mt-4 text-4xl font-semibold text-primary-foreground md:text-6xl">
              Connect veterans, partners, and mission-ready technology.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85">
              2Marines is a public hub that aligns veteran support programs with
              trusted partners, clear approvals, and audited outcomes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <a
                  href="https://shieldmate.2marines.us"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit ShieldMate
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a
                  href="https://marinecoin.2marines.us"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore MarineCoin
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-primary-foreground">
            <h3 className="text-xl font-semibold">Quick actions</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
              <li>Claims-first governance</li>
              <li>Approval gates for regulated actions</li>
              <li>Partner and org isolation</li>
              <li>Audit-ready reporting</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/info" className="text-sm underline">
                Learn the mission
              </Link>
              <Link to="/brand" className="text-sm underline">
                View brand kit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map((item) => (
            <Card key={item.title} className="bg-card/70">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                <p>{item.body}</p>
                <Button variant="outline" size="sm" asChild>
                  {isExternal(item.href) ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.cta}
                    </a>
                  ) : (
                    <Link to={item.href}>{item.cta}</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
