import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MarineCoinPartnerApply() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Partner application</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Share your organization details and how you support veterans. This
          form does not submit yet; it is a UI placeholder.
        </p>
        <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Organization name</label>
              <Input placeholder="Partner organization" />
            </div>
            <div>
              <label className="text-sm font-medium">Primary contact</label>
              <Input placeholder="Full name" />
            </div>
            <div>
              <label className="text-sm font-medium">Contact email</label>
              <Input placeholder="you@example.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium">Programs offered</label>
              <Textarea placeholder="Describe your veteran support programs." />
            </div>
            <Button>Submit application</Button>
          </div>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
