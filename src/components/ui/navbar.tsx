"use client";

import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { submitUiuxEvent } from "@/services/uiuxAudit";

type NavbarMode = "default" | "marinecoin";

const shieldmateLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const marineCoinLinks = [
  { label: "Home", href: "/marinecoin" },
  { label: "How it works", href: "/marinecoin/how-it-works" },
  { label: "Use cases", href: "/marinecoin/use-cases" },
  { label: "Impact", href: "/marinecoin/impact" },
  { label: "Partners", href: "/marinecoin/partners" },
  { label: "Roadmap", href: "/marinecoin/roadmap" },
  { label: "FAQ", href: "/marinecoin/faq" },
  { label: "Waitlist", href: "/marinecoin/waitlist" },
];

const siteLinks = [
  { label: "2Marines", href: "/site" },
  { label: "Programs", href: "/site/programs" },
  { label: "Veterans", href: "/site/veterans" },
  { label: "Partners", href: "/site/partners" },
  { label: "Donate", href: "/site/donate" },
  { label: "Contact", href: "/site/contact" },
];

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

export function Navbar({ mode = "default" }: { mode?: NavbarMode }) {
  const location = useLocation();
  const navLinks = mode === "marinecoin" ? marineCoinLinks : shieldmateLinks;
  const showSiteLinks = mode === "default";
  const homeHref = mode === "marinecoin" ? "/marinecoin" : "/";
  const logoSrc =
    mode === "marinecoin"
      ? "/brand/marinecoin-logo.svg"
      : "/brand/shieldmate-logo.svg";
  const logoAlt = mode === "marinecoin" ? "MarineCoin" : "ShieldMate";
  const logNav = (href: string) => {
    void submitUiuxEvent({
      route: href,
      eventType: "nav_click",
      metadata: { href },
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <header className="border-b bg-background/70 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to={homeHref} className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt={logoAlt}
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => logNav(item.href)}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(location.pathname, item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          {showSiteLinks && (
            <>
              <span className="h-5 w-px bg-border" />
              {siteLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => logNav(item.href)}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(location.pathname, item.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {mode === "marinecoin" ? (
            <Link to="/marinecoin/waitlist">
              <Button>Join Waitlist</Button>
            </Link>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    {mode === "marinecoin" ? "MarineCoin" : "ShieldMate"}
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {navLinks.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => logNav(item.href)}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                {showSiteLinks && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      2Marines
                    </p>
                    <div className="mt-2 flex flex-col gap-2">
                      {siteLinks.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => logNav(item.href)}
                          className="text-sm font-medium"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {mode === "marinecoin" ? (
                    <Link to="/marinecoin/waitlist" className="flex-1">
                      <Button className="w-full">Join Waitlist</Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/signin" className="flex-1">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/signup" className="flex-1">
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
