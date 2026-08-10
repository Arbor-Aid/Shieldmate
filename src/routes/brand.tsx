import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";

const tokenNames = [
  "--background",
  "--foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--ring",
];

function readCssVar(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function Brand() {
  const [tokens, setTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    const t: Record<string, string> = {};
    tokenNames.forEach((n) => (t[n] = readCssVar(n)));
    setTokens(t);
  }, []);

  const copyBlocks = useMemo(
    () => ({
      mission:
        "2Marines connects veterans, technology, and community through partnerships and practical support pathways.",
      partnerCta:
        "Partner with 2Marines to align services, reduce friction, and expand access for veterans and families.",
      veteranCta:
        "If you’re a veteran or supporter, start here—explore the mission, platforms, and ways to connect.",
    }),
    []
  );

  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">Design System Preview</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Brand Starter Kit</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            A shared visual baseline so 2Marines, ShieldMate, and MarineCoin stay consistent without merging apps.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Brand overview</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use shared tokens, typography, and layout patterns. Keep each site independent while maintaining a cohesive experience.
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Logo previews</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="h-16 rounded-xl border bg-card" title="2Marines logo placeholder" />
              <div className="h-16 rounded-xl border bg-card" title="ShieldMate logo placeholder" />
              <div className="h-16 rounded-xl border bg-card" title="MarineCoin logo placeholder" />
              <div className="col-span-3 text-xs text-muted-foreground">
                Placeholders are OK for now — drop real assets later.
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card>
            <CardHeader><CardTitle>Color tokens (CSS variables)</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {tokenNames.map((t) => (
                <div key={t} className="rounded-xl border p-3">
                  <div className="text-xs font-medium">{t}</div>
                  <div className="mt-1 text-xs text-muted-foreground break-all">
                    {tokens[t] || "(unavailable until client render)"}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Typography samples</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-semibold tracking-tight">Headline (H1)</div>
              <div className="text-xl font-semibold">Section Title (H2)</div>
              <div className="text-base text-muted-foreground">
                Body text should stay simple and readable—high clarity, minimal jargon.
              </div>
              <div className="text-xs text-muted-foreground">Small helper text</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Component previews</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
              <Input placeholder="Input" />
              <div className="rounded-xl border p-3 text-sm text-muted-foreground">
                Cards should be rounded, padded, and readable. Avoid heavy visual noise.
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Common UI patterns</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Hero + short supporting copy</p>
              <p>• 3-card grid for primary entry points</p>
              <p>• Clear CTA buttons (internal routes or external domains)</p>
              <p>• Consistent footer with platform links</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Copy blocks</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <div className="text-xs font-semibold text-foreground">Mission</div>
                <div>{copyBlocks.mission}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Partner CTA</div>
                <div>{copyBlocks.partnerCta}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Veteran CTA</div>
                <div>{copyBlocks.veteranCta}</div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card>
            <CardHeader><CardTitle>Usage guidance</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Tokens live in your global CSS variables (shadcn theme).</p>
              <p>• Reuse components/patterns, but do not import auth/platform modules into this public site.</p>
              <p>• Keep external CTAs pointing to the correct domain (ShieldMate and MarineCoin remain separate deployments).</p>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}