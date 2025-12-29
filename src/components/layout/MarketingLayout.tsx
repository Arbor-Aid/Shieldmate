import { ReactNode } from "react";
import { Navbar } from "@/components/ui/navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function MarketingLayout({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
