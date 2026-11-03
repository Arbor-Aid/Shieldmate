import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Partnerships() {
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    partnerType: "Nonprofit",
    message: "",
  });

  function submit() {
    console.log("[Partnership Inquiry]", { ...form, ts: new Date().toISOString() });
    alert("Inquiry submitted (demo). We’ll wire this to a real inbox later.");
    setForm({ name: "", org: "", email: "", partnerType: "Nonprofit", message: "" });
  }

  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">Work with us</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Partnerships</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            We collaborate with nonprofits, businesses, and public/community organizations to improve access,
            delivery, and outcomes for veterans and families.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Nonprofits</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Shared referrals, programs, events, and coordinated support pathways.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Businesses</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sponsorships, hiring pipelines, benefits/perks, and community impact campaigns.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Government / Community</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Public initiatives, pilots, community services coordination, and resource alignment.
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Partner tiers (non-priced)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Community</strong> — Basic collaboration and shared visibility.</p>
              <p><strong>Program</strong> — Active referral/program participation and joint planning.</p>
              <p><strong>Strategic</strong> — Deep alignment, co-branded initiatives, and long-term outcomes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Inquiry form</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Organization" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
              </div>
              <Input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Partner type (Nonprofit / Business / Government)"
                value={form.partnerType}
                onChange={(e) => setForm({ ...form, partnerType: e.target.value })}
              />
              <Textarea
                placeholder="What are you looking to collaborate on?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <Button onClick={submit} disabled={!form.email.includes("@") || !form.message.trim()}>
                Submit inquiry
              </Button>
              <div className="text-xs text-muted-foreground">
                Client-side only for now (logs to console).
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}