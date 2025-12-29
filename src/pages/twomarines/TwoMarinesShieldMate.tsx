import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const capabilities = [
  {
    title: "Claims-based access",
    body: "Role and org permissions enforced through Firebase ID token claims.",
  },
  {
    title: "Approvals workflow",
    body: "DRAFT to PENDING to APPROVED with audit logs for regulated actions.",
  },
  {
    title: "MCP gateway",
    body: "Centralized tool execution with structured logging and guardrails.",
  },
];

export default function TwoMarinesShieldMate() {
  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">ShieldMate</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          ShieldMate is the secure operations platform that powers approvals,
          partner workflows, and outcome tracking across the 2Marines ecosystem.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {capabilities.map((item) => (
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
        <div className="mt-8">
          <Button asChild>
            <a
              href="https://shieldmate.2marines.us"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit ShieldMate
            </a>
          </Button>
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
