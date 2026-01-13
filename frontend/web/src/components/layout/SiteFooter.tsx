import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto grid gap-6 py-10 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">ShieldMate</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure, claims-based support operations for veterans and partner
            organizations.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/features">Features</Link>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">2Marines</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/site">Main Site</Link>
            </li>
            <li>
              <Link to="/site/programs">Programs</Link>
            </li>
            <li>
              <Link to="/site/donate">Donate</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">MarineCoin</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/marinecoin">Overview</Link>
            </li>
            <li>
              <Link to="/marinecoin/how-it-works">How it works</Link>
            </li>
            <li>
              <Link to="/marinecoin/use-cases">Use cases</Link>
            </li>
            <li>
              <Link to="/marinecoin/partners">Partners</Link>
            </li>
            <li>
              <Link to="/marinecoin/waitlist">Join waitlist</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
