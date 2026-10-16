import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CtaCard({
  title,
  description,
  icon,
  href,
  ctaLabel,
  badge,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  href: string;
  ctaLabel: string;
  badge?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border bg-card p-2">{icon}</div>
            <div>
              <CardTitle className="text-base md:text-lg">{title}</CardTitle>
              {badge ? (
                <div className="mt-1 text-xs text-muted-foreground">{badge}</div>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto">
          <Button asChild className="w-full">
            <a href={href}>{ctaLabel}</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}