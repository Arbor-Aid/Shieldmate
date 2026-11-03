import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Building2, ClipboardList } from "lucide-react";

export default function ShieldMate() {
  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">Platform</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">ShieldMate</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            ShieldMate is a platform designed to help coordinate support between veterans, service providers,
            and trusted partner organizations—without overwhelming users with technical complexity.
          </p>

          <div className="mt-6">
            <Button asChild>
              <a href="https://shieldmate.2marines.us/" target="_blank" rel="noreferrer">
                Go to ShieldMate <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="h-5 w-5" />
              <CardTitle>Who it’s for</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Veterans, case coordinators, and partner organizations working together to deliver outcomes.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <ClipboardList className="h-5 w-5" />
              <CardTitle>Key capabilities</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Organized workflows, clear next steps, and consistent communication patterns.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Building2 className="h-5 w-5" />
              <CardTitle>Partner-ready</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Supports collaboration across nonprofits, businesses, and community stakeholders.
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}
