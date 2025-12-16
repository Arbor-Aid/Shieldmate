import ProtectedRoute from "@/components/ProtectedRoute";
import RoleCheck from "@/components/RoleCheck";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";

const OrgAdmin = () => {
  return (
    <ProtectedRoute>
      <RoleCheck allowedRoles={["admin"]}>
        <div className="min-h-screen bg-background">
          <NavigationWithNotifications />
          <main className="container mx-auto py-10 px-4 space-y-4">
            <h1 className="text-3xl font-bold">Org Admin Control</h1>
            <p className="text-muted-foreground">
              Admin-only area for managing organizations, memberships, and roles. UI forthcoming.
            </p>
          </main>
        </div>
      </RoleCheck>
    </ProtectedRoute>
  );
};

export default OrgAdmin;
