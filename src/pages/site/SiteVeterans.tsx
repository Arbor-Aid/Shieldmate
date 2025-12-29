import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function SiteVeterans() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">For Veterans</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          We meet you with a structured intake, real human support, and secure
          pathways to housing, employment, and wellness resources.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/signup">
            <Button>Start your intake</Button>
          </Link>
          <Link to="/site/contact">
            <Button variant="outline">Talk to the team</Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
