import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const partnerBenefits = [
  "Secure org-based access",
  "Approval-driven collaboration",
  "Shared reporting and outcomes",
];

export default function SitePartners() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Partners</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Partner organizations join ShieldMate to coordinate care while
          protecting data with claims-based access.
        </p>
        <Card className="mt-8">
          <CardContent className="space-y-2 py-6 text-sm text-muted-foreground">
            {partnerBenefits.map((benefit) => (
              <p key={benefit}>• {benefit}</p>
            ))}
          </CardContent>
        </Card>
        <div className="mt-6">
          <Link to="/contact">
            <Button>Partner with us</Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
