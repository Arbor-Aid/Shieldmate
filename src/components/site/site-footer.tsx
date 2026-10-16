import { Container } from "./container";
import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">2Marines</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Connecting veterans, technology, and community through practical programs,
              partnerships, and platforms.
            </p>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Explore</div>
            <div className="mt-2 grid gap-2 text-muted-foreground">
              <Link to="/info" className="hover:text-foreground">About</Link>
              <Link to="/partnerships" className="hover:text-foreground">Partnerships</Link>
              <Link to="/brand" className="hover:text-foreground">Brand Starter Kit</Link>
              <Link to="/socials" className="hover:text-foreground">Socials</Link>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Platforms</div>
            <div className="mt-2 grid gap-2 text-muted-foreground">
              <a className="hover:text-foreground" href="https://shieldmate.2marines.us/" target="_blank" rel="noreferrer">
                ShieldMate
              </a>
              <a className="hover:text-foreground" href="https://marinecoin.2marines.us/marinecoin" target="_blank" rel="noreferrer">
                MarineCoin
              </a>
              <Link to="/store" className="hover:text-foreground">Shop</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} 2Marines. Public landing hub only. No authentication on this site.
        </div>
      </Container>
    </footer>
  );
}
