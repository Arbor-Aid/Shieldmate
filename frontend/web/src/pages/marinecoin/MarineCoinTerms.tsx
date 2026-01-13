import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";

export default function MarineCoinTerms() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">
          MarineCoin participation is governed by ShieldMate program terms and
          partner agreements. Access is limited to approved pilot participants.
        </p>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Credits are issued only after verified support actions and approvals.
          </p>
          <p>
            Unauthorized use, resale, or transfer is prohibited.
          </p>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
