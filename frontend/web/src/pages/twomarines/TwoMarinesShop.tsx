import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SHOPIFY_STORE_URL } from "@/config/shop";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function TwoMarinesShop() {
  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16 md:py-24">
        <Card className="mx-auto max-w-3xl border-border bg-card shadow-sm">
          <CardHeader className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              2Marines Shop
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Shop to Support Veterans
            </h1>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Every purchase helps support 2Marines' veteran housing, outreach,
              technology, and community impact programs.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={SHOPIFY_STORE_URL}>
                  Enter the 2Marines Shop
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">Back to Public Hub</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </TwoMarinesLayout>
  );
}
