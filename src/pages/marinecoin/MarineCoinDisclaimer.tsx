import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";

export default function MarineCoinDisclaimer() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Disclaimer</h1>
        <p className="mt-4 text-muted-foreground">
          MarineCoin is not a financial instrument, investment, or cryptocurrency.
          It is a regulated impact credit issued for verified veteran support
          actions.
        </p>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Participation does not guarantee funding or services. All issuance
            and redemption decisions are subject to approvals and policy review.
          </p>
          <p>This content is for informational purposes only.</p>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
