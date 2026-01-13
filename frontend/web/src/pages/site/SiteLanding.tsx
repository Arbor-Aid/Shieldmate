import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { LetsWorkSection } from "@/components/ui/lets-work-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const programs = [
  { title: "Career Transition", body: "Workforce readiness and placement." },
  { title: "Housing Support", body: "Safe housing and benefits navigation." },
  { title: "Peer Mentorship", body: "Community-led support networks." },
];

export default function SiteLanding() {
  return (
    <MarketingLayout>
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container mx-auto">
          <h1 className="text-4xl font-semibold text-primary-foreground md:text-6xl">
            2Marines — Veteran support with operational clarity.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            From intake to outcomes, we connect veterans to the programs that
            move them forward.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/site/programs">
              <Button variant="secondary">Explore Programs</Button>
            </Link>
            <Link to="/site/donate">
              <Button variant="outline">Donate</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {programs.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-16">
        <AnimatedTestimonials />
      </section>

      <section className="container mx-auto pb-16">
        <LetsWorkSection />
      </section>
    </MarketingLayout>
  );
}
