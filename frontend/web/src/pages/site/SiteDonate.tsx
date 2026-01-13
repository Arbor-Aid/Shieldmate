import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";

export default function SiteDonate() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Donate</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Your support sustains veteran intake, case coordination, and partner
          programs across the 2Marines network.
        </p>
        <div className="mt-6 flex gap-3">
          <Button>Donate Now</Button>
          <Button variant="outline">Corporate Sponsorship</Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
