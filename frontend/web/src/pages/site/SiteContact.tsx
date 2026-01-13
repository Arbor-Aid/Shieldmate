import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SiteContact() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Contact 2Marines</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Reach out to learn about partnerships, programs, or volunteer
          opportunities.
        </p>
        <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input placeholder="you@example.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="How can we help?" />
            </div>
            <Button>Send message</Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
