import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MarineCoinWaitlist() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Join the waitlist</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Tell us who you are and how you plan to use MarineCoin. This form is
          a UI placeholder only.
        </p>
        <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <Input placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input placeholder="you@example.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium">Organization</label>
              <Input placeholder="Org name (optional)" />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea placeholder="Tell us about your use case." />
            </div>
            <Button>Join waitlist</Button>
          </div>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
