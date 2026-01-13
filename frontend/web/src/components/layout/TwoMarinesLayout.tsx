import { ReactNode } from "react";
import { TwoMarinesNavbar } from "@/components/layout/TwoMarinesNavbar";
import { TwoMarinesFooter } from "@/components/layout/TwoMarinesFooter";

export function TwoMarinesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TwoMarinesNavbar />
      <main>{children}</main>
      <TwoMarinesFooter />
    </div>
  );
}
