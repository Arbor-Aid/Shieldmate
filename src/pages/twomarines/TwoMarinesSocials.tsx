import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Linkedin, Twitter, Youtube, Globe } from "lucide-react";

const socialLinks = [
  {
    label: "Website",
    href: "https://www.2marines.us",
    icon: Globe,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/2marines",
    icon: Linkedin,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@2marines",
    icon: Youtube,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/2marines",
    icon: Instagram,
  },
  {
    label: "Twitter",
    href: "https://x.com/2marines",
    icon: Twitter,
  },
];

export default function TwoMarinesSocials() {
  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Socials</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Follow 2Marines for updates, partner highlights, and veteran support
          announcements.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.label}>
                <CardContent className="flex items-center justify-between py-6">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary"
                  >
                    Visit
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
