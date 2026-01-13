import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function MarineCoinAbout() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold">About MarineCoin</h1>
          <p className="mt-4 text-muted-foreground">
            MarineCoin is a mission-aligned credit system designed to recognize
            verified veteran support actions. It is governed by ShieldMate
            approvals and monitored through audit logs.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 py-6">
              <h3 className="text-xl font-semibold">Purpose</h3>
              <p className="text-sm text-muted-foreground">
                Reward verified, human-reviewed support actions without turning
                them into speculative assets.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 py-6">
              <h3 className="text-xl font-semibold">Governance</h3>
              <p className="text-sm text-muted-foreground">
                All issuance and redemption actions require claims-based RBAC,
                approvals, and auditable trails.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
