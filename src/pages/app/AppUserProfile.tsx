import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

export default function AppUserProfile() {
  return (
    <AppShell title="Profile" subtitle="Manage your personal information">
      <p className="text-muted-foreground">
        Visit the full profile page to update your details.
      </p>
      <div className="mt-4">
        <Link to="/profile" className="text-primary underline">
          Open profile
        </Link>
      </div>
    </AppShell>
  );
}
