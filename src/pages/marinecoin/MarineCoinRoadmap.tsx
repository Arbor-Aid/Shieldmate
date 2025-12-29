import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Card, CardContent } from "@/components/ui/card";

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Pilot onboarding",
    details: "Invite early partner orgs and validate approval workflows.",
  },
  {
    phase: "Phase 2",
    title: "Verified issuance",
    details: "Ship MarineCoin issuance tied to audited support actions.",
  },
  {
    phase: "Phase 3",
    title: "Partner redemption",
    details: "Enable redemption for approved veteran services and programs.",
  },
  {
    phase: "Phase 4",
    title: "Reporting layer",
    details: "Publish org-level impact dashboards and audit summaries.",
  },
];

export default function MarineCoinRoadmap() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Roadmap</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          MarineCoin evolves in phases to ensure compliance, trust, and
          measurable outcomes.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {roadmapItems.map((item) => (
            <Card key={item.phase}>
              <CardContent className="space-y-2 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {item.phase}
                </p>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarineCoinLayout>
  );
}
