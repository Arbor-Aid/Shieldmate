import { ReactNode } from "react";
import { Navbar } from "@/components/ui/navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function MarineCoinLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mode="marinecoin" />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
