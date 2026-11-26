import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BadgeCheck, Handshake, Receipt } from "lucide-react";

export default function MarineCoin() {
  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">Impact / Loyalty Concept</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">MarineCoin</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            MarineCoin is a conceptual recognition and participation program designed to support engagement,
            community impact, and partner collaboration. This page is informational only.
          </p>

          <div className="mt-6">
            <Button asChild>
              <a href="https://marinecoin.2marines.us/marinecoin" target="_blank" rel="noreferrer">
                Go to MarineCoin <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <BadgeCheck className="h-5 w-5" />
              <CardTitle>Use cases</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Recognition for participation, event engagement, volunteer milestones, and partner campaigns.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Handshake className="h-5 w-5" />
              <CardTitle>Partner participation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Partners may offer perks, discounts, or acknowledgments under program rules.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Receipt className="h-5 w-5" />
              <CardTitle>Rules apply</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Participation is governed by program terms and eligibility requirements.
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>Compliance Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• MarineCoin is a conceptual program and informational only.</p>
              <p>• MarineCoin is <strong>not a security</strong>.</p>
              <p>• There is <strong>no promise of profit</strong> or appreciation.</p>
              <p>• Program rules, eligibility, and partner terms apply.</p>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}
