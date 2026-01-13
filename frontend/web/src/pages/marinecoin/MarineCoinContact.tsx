import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";

export default function MarineCoinContact() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Contact MarineCoin</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Reach out for pilot access, partner onboarding, or governance
          questions.
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
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
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Ask a quick question</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This assistant does not execute actions; it captures quick
              questions for follow-up.
            </p>
            <div className="mt-4">
              <PromptInputBox
                onSend={(message) => {
                  console.log("MarineCoin contact prompt:", message);
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
