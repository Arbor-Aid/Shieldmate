import { Outlet } from "react-router-dom";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function SiteLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav />
      <main className="pt-2">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}