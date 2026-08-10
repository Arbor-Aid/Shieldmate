import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Shop() {
  const [email, setEmail] = useState("");

  function submitNewsletter() {
    // client-side only
    console.log("[Newsletter Capture]", { email, ts: new Date().toISOString() });
    setEmail("");
    alert("Thanks — you’re on the list (demo capture).");
  }

  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">Coming Soon</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Shop</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Merch and partner offers are in progress. Join the newsletter to get notified when we launch.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>2Marines Merch</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Coming Soon</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>MarineCoin Merch</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Coming Soon</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Partner Offers</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Coming Soon</CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <Button onClick={submitNewsletter} disabled={!email.includes("@")}>
                Notify me
              </Button>
              <div className="text-xs text-muted-foreground">
                Client-side capture only (no backend on this site).
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}