import { useEffect, useState } from "react";
import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const colorTokens = [
  { name: "--background", value: "var(--background)" },
  { name: "--foreground", value: "var(--foreground)" },
  { name: "--primary", value: "var(--primary)" },
  { name: "--secondary", value: "var(--secondary)" },
  { name: "--muted", value: "var(--muted)" },
  { name: "--border", value: "var(--border)" },
  { name: "--ring", value: "var(--ring)" },
];

const copyBlocks = [
  {
    title: "Mission statement",
    body: "2Marines connects veterans to verified programs and partners with clear, auditable support workflows.",
  },
  {
    title: "Partner call-to-action",
    body: "Partner with 2Marines to deliver outcomes that are accountable, measurable, and veteran-first.",
  },
  {
    title: "Veteran call-to-action",
    body: "If you need support, our partners are ready to help with clear next steps and trusted guidance.",
  },
];

export default function TwoMarinesBrand() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [resolvedTokens, setResolvedTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const styles = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    colorTokens.forEach((token) => {
      const raw = styles.getPropertyValue(token.name).trim();
      next[token.name] = raw ? `hsl(${raw})` : "";
    });
    setResolvedTokens(next);
  }, []);

  const handleCopy = async (tokenName: string, fallback: string) => {
    const value = resolvedTokens[tokenName] || fallback;
    if (!value) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopiedToken(tokenName);
        window.setTimeout(() => setCopiedToken(null), 1500);
      }
    } catch (error) {
      console.warn("Copy failed", error);
    }
  };

  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Brand Starter Kit</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Shared design tokens, typography, and UI patterns used across
          ShieldMate, MarineCoin, and the 2Marines public site.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Logos</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8">
                <div className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
                  2Marines Logo
                </div>
                <p className="text-xs text-muted-foreground">
                  Replace with official 2Marines logo asset.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8">
                <img
                  src="/brand/shieldmate-logo.svg"
                  alt="ShieldMate"
                  className="h-10 w-auto"
                />
                <p className="text-xs text-muted-foreground">ShieldMate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8">
                <img
                  src="/brand/marinecoin-logo.svg"
                  alt="MarineCoin"
                  className="h-10 w-auto"
                />
                <p className="text-xs text-muted-foreground">MarineCoin</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Color tokens</h2>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {copiedToken ? `${copiedToken} copied to clipboard.` : "Tap Copy to save a token value."}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {colorTokens.map((token) => (
              <Card key={token.name}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-6">
                  <div>
                    <p className="text-sm font-medium">{token.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {resolvedTokens[token.name] || token.value}
                    </p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-md border border-border"
                    style={{ backgroundColor: `hsl(${token.value})` }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(token.name, token.value)}
                  >
                    Copy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Typography</h2>
          <div className="mt-6 space-y-3">
            <h1 className="text-4xl font-semibold">Heading 1 - Poppins</h1>
            <h2 className="text-3xl font-semibold">Heading 2 - Poppins</h2>
            <h3 className="text-2xl font-semibold">Heading 3 - Poppins</h3>
            <h4 className="text-xl font-semibold">Heading 4 - Poppins</h4>
            <p className="text-base text-muted-foreground">
              Body text uses Inter for clarity across web and product surfaces.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Components preview</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Buttons and badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Badge>Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inputs and cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Input field" />
                <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  Card content example with muted text and border styling.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">UI patterns</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hero pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="text-xl font-semibold">Mission-ready operations</h3>
                <p className="text-sm text-muted-foreground">
                  Simple hero layout with title, supporting copy, and CTA.
                </p>
                <Button size="sm">Primary CTA</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3-card grid</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-md border border-border p-3 text-xs text-muted-foreground">
                    Card {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">FAQ accordion pattern</h2>
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do partners onboard?</AccordionTrigger>
              <AccordionContent>
                Partners complete an intake form, review policies, and align on
                approval and reporting steps.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is MarineCoin a cryptocurrency?</AccordionTrigger>
              <AccordionContent>
                No. MarineCoin is an impact credit concept tied to verified
                support outcomes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Reusable copy blocks</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {copyBlocks.map((block) => (
              <Card key={block.title}>
                <CardContent className="space-y-2 py-6">
                  <p className="text-sm font-semibold">{block.title}</p>
                  <p className="text-sm text-muted-foreground">{block.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Export guidance</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Token values live in src/index.css as CSS variables.</li>
            <li>Web components consume tokens via Tailwind utilities.</li>
            <li>Flutter mapping lives in shared/design-tokens/flutter_theme_mapping.md.</li>
          </ul>
        </section>
      </section>
    </TwoMarinesLayout>
  );
}
