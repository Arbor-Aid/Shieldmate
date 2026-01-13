import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ShieldmateContact() {
  return (
    <MarketingLayout>
      <section className="container mx-auto py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold">Contact</h1>
          <p className="mt-4 text-muted-foreground">
            Tell us about your team, your mission, and the workflows you want
            to protect.
          </p>
        </div>
        <div className="mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6">
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
