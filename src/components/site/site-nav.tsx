import { NavLink, Link, useLocation } from "react-router-dom";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/info", label: "About" },
  { to: "/shieldmate", label: "ShieldMate" },
  { to: "/marinecoin", label: "MarineCoin" },
  { to: "/partnerships", label: "Partnerships" },
  { to: "/shop", label: "Shop" },
  { to: "/brand", label: "Brand Kit" },
  { to: "/socials", label: "Socials" },
];

export function SiteNav() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl border bg-card" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">2Marines</div>
            <div className="text-[11px] text-muted-foreground">Public Hub</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )
              }
              end={i.to === "/"}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Primary external CTA: ShieldMate */}
          <Button asChild size="sm" className="hidden md:inline-flex">
            <a href="https://shieldmate.2marines.us" target="_blank" rel="noreferrer">
              Open ShieldMate <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>

          {/* Mobile: simple current page label */}
          <div className="md:hidden text-xs text-muted-foreground truncate max-w-[45vw]">
            {nav.find((n) => n.to === pathname)?.label ?? "2Marines"}
          </div>
        </div>
      </Container>
    </header>
  );
}