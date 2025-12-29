import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "Veterans supported", value: "1,250+" },
  { label: "Partner orgs onboarded", value: "38" },
  { label: "Verified actions logged", value: "4,900+" },
  { label: "Programs funded", value: "22" },
];

export default function MarineCoinImpact() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Impact</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Metrics below reflect pilot targets and verified outputs as MarineCoin
          scales. Final reporting will be sourced from audited records.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="py-8 text-center">
                <p className="text-3xl font-semibold text-primary">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {metric.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarineCoinLayout>
  );
}
