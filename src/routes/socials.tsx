import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Github, Twitter } from "lucide-react";

const socials = [
  { label: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "#" },
  { label: "X / Twitter", icon: <Twitter className="h-5 w-5" />, href: "#" },
  { label: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "#" },
  { label: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" },
  { label: "GitHub", icon: <Github className="h-5 w-5" />, href: "#" },
];

export default function Socials() {
  return (
    <>
      <Section>
        <Container>
          <Badge variant="secondary">Links</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Socials</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Official links hub. Replace the placeholders with your real URLs.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              <Card className="transition hover:bg-muted/40">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="rounded-xl border bg-card p-2">{s.icon}</div>
                  <CardTitle className="text-base">{s.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Tap to open
                </CardContent>
              </Card>
            </a>
          ))}
        </Container>
      </Section>
    </>
  );
}