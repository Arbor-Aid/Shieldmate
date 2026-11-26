import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Info() {
  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">About 2Marines</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Mission & What We Do</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            2Marines connects veterans and communities to practical support through partnerships,
            programs, and technology-enabled coordination.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Strengthen stability for veterans and families by reducing friction between needs,
              services, and trusted community partners.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Do</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We coordinate referrals, support programs, and partner collaboration—so veterans can
              access help faster and partners can measure real outcomes.
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>How it works: Step 1</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Veterans and partners connect through a clear entry point (program, partner, or platform).
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>How it works: Step 2</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Needs are matched with the right support path and partner resources.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>How it works: Step 3</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Follow-through is tracked and improved over time with feedback and collaboration.
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>Why it matters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Veterans deserve simple, respectful access to support. Partners deserve clarity, reduced
              administrative friction, and shared visibility into what’s working.
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}