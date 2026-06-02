import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { CtaCard } from "@/components/site/cta-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, Shield, Coins, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Section className="pt-10 md:pt-14">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <Badge variant="secondary">Public Hub</Badge>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                2Marines — Connecting Veterans, Technology, and Community
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                A simple hub for our mission, partnerships, and platforms. Clear entry points for
                veterans, partners, and supporters.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/info">
                    Learn the mission <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/partnerships">Partner with us</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="text-sm font-semibold">Quick Links</div>
              <div className="mt-3 grid gap-3">
                <Button asChild variant="secondary" className="justify-between">
                  <a href="https://shieldmate.2marines.us/" target="_blank" rel="noreferrer">
                    Open ShieldMate <span className="text-xs text-muted-foreground">Platform</span>
                  </a>
                </Button>
                <Button asChild variant="secondary" className="justify-between">
                  <a href="https://marinecoin.2marines.us/marinecoin" target="_blank" rel="noreferrer">
                    View MarineCoin <span className="text-xs text-muted-foreground">Concept</span>
                  </a>
                </Button>
                <Button asChild variant="secondary" className="justify-between">
                  <Link to="/brand">
                    Brand Starter Kit <span className="text-xs text-muted-foreground">Design system</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            <CtaCard
              title="ShieldMate"
              badge="Platform"
              description="A secure platform built to help coordinate support, services, and outcomes across organizations and programs."
              icon={<Shield className="h-5 w-5" />}
              href="/shieldmate"
              ctaLabel="Explore ShieldMate"
            />
            <CtaCard
              title="MarineCoin"
              badge="Impact / Loyalty Concept"
              description="A recognition and reward concept designed for engagement, community participation, and partner support."
              icon={<Coins className="h-5 w-5" />}
              href="/marinecoin"
              ctaLabel="Explore MarineCoin"
            />
            <CtaCard
              title="Partnerships"
              badge="Work with us"
              description="Nonprofits, businesses, and public entities can collaborate through referrals, programs, and shared initiatives."
              icon={<Handshake className="h-5 w-5" />}
              href="/partnerships"
              ctaLabel="Explore Partnerships"
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
