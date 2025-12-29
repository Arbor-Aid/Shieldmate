import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const programList = [
  {
    title: "Employment Pathways",
    description: "Career coaching, resume support, and placement assistance.",
  },
  {
    title: "Housing Navigation",
    description: "Connect veterans with stable housing and benefits.",
  },
  {
    title: "Wellness Support",
    description: "Access to mental health resources and peer support.",
  },
];

export default function SitePrograms() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Programs</h1>
        <p className="mt-4 text-muted-foreground">
          Programs designed to meet veterans where they are and move them
          forward with confidence.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {programList.map((program) => (
            <Card key={program.title}>
              <CardHeader>
                <CardTitle>{program.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {program.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
