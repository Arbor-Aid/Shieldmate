import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useRoleAuth } from "@/hooks/useRoleAuth";

export default function AppHub() {
  const navigate = useNavigate();
  const { isAdmin, isOrganization, isClient, loading } = useRoleAuth();

  useEffect(() => {
    if (loading) return;
    if (isAdmin) {
      navigate("/app/admin");
      return;
    }
    if (isOrganization) {
      navigate("/app/org");
      return;
    }
    if (isClient) {
      navigate("/app/user");
      return;
    }
    navigate("/profile");
  }, [loading, isAdmin, isOrganization, isClient, navigate]);

  return (
    <AppShell title="Loading your workspace">
      <p className="text-muted-foreground">Routing to the right workspace...</p>
    </AppShell>
  );
}
