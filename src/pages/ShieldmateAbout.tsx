import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function ShieldmateAbout() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold">About ShieldMate</h1>
          <p className="mt-4 text-muted-foreground">
            ShieldMate is the operations layer for veteran-focused support
            teams. We blend secure workflows, human approvals, and multi-agent
            orchestration into a single platform.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 py-6">
              <h3 className="text-xl font-semibold">Mission</h3>
              <p className="text-sm text-muted-foreground">
                Give every veteran a trusted path to resources, backed by
                compliant operations and transparent oversight.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 py-6">
              <h3 className="text-xl font-semibold">Why we built it</h3>
              <p className="text-sm text-muted-foreground">
                Partner orgs needed a platform that honors approvals, protects
                data, and scales across teams without losing trust.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
