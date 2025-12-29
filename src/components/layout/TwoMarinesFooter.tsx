import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Info", href: "/info" },
  { label: "ShieldMate", href: "/shieldmate" },
  { label: "MarineCoin", href: "/marinecoin" },
  { label: "Shop", href: "/shop" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Brand Kit", href: "/brand" },
  { label: "Socials", href: "/socials" },
];

export function TwoMarinesFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">2Marines</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A public hub connecting veterans, partners, and mission-ready
            support platforms.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link to={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Legal</p>
          <p className="mt-3 text-sm text-muted-foreground">
            MarineCoin is an impact credit concept. It is not investment advice,
            a cryptocurrency, or a promise of profit. Participation is subject to
            program rules and eligibility.
          </p>
        </div>
      </div>
    </footer>
  );
}
