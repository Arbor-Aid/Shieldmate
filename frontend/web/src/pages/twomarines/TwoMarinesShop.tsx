import { useState } from "react";
import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type NotifyCardProps = {
  title: string;
  description: string;
};

function NotifyCard({ title, description }: NotifyCardProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputId = `${title.toLowerCase().replace(/\s+/g, "-")}-notify`;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    console.log("Shop notify:", { title, email });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{description}</p>
        {submitted ? (
          <p className="text-sm font-medium text-primary" aria-live="polite">
            Thanks! We will keep you updated.
          </p>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={inputId}>
              Email address
            </label>
            <Input
              id={inputId}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" size="sm">
              Notify me
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function TwoMarinesShop() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const newsletterId = "newsletter-email";

  const handleNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterSent(true);
    console.log("Newsletter signup:", { email: newsletterEmail });
  };

  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Shop</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          The 2Marines shop is launching soon. Join the newsletter to stay
          updated on merch, partner offers, and MarineCoin campaigns.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <NotifyCard
            title="MarineCoin Merch"
            description="Limited drops that celebrate verified impact."
          />
          <NotifyCard
            title="2Marines Shop"
            description="Mission-first apparel and veteran support gear."
          />
          <NotifyCard
            title="Partner Offers"
            description="Partner discounts tied to verified outcomes."
          />
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold">Join the newsletter</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We will only send essential updates about launches and partner
            opportunities.
          </p>
          {newsletterSent ? (
            <p className="mt-4 text-sm font-medium text-primary" aria-live="polite">
              You are on the list. Thank you for staying connected.
            </p>
          ) : (
            <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleNewsletter}>
              <label className="sr-only" htmlFor={newsletterId}>
                Email address
              </label>
              <Input
                id={newsletterId}
                type="email"
                placeholder="you@example.com"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                required
              />
              <Button type="submit">Join the newsletter</Button>
            </form>
          )}
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
