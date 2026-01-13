import { Link, useLocation } from "react-router-dom";
import { Menu, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Info", href: "/info" },
  { label: "ShieldMate", href: "/shieldmate" },
  { label: "MarineCoin", href: "/marinecoin" },
  { label: "Shop", href: "/shop" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Brand Kit", href: "/brand" },
  { label: "Socials", href: "/socials" },
];

const socialLinks = [
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

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

export function TwoMarinesNavbar() {
  const location = useLocation();

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            2Marines
          </span>
          <span className="text-sm font-semibold">Public Hub</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
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
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/partnerships">
            <Button variant="outline" size="sm">
              Partner with 2Marines
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
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
                    2Marines Hub
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Socials
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {socialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
                <Link to="/partnerships">
                  <Button className="w-full">Partner with 2Marines</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
