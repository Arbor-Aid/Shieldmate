import { useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { OrganizationAnalytics } from "@/components/organization/OrganizationAnalytics";
import { AnalyticsDashboard as CustomAnalytics } from "@/components/analytics/AnalyticsDashboard";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useMcpClient } from "@/hooks/useMcpClient";
import { trackEvent } from "@/lib/firebase";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleCheck from "@/components/RoleCheck";
import { AnalyticsData } from "@/types/analytics";

export default function AnalyticsDashboard() {
  const { userRole, isAdmin, isOrganization } = useRoleAuth();
  const { organization } = useOrganization();

  useEffect(() => {
    trackEvent('analytics_dashboard_page_view', { userRole });
  }, [userRole]);

  const analyticsOrgId = useMemo(() => {
    if (isOrganization && organization?.id) {
      return organization.id;
    }
    if (isAdmin) {
      return 'admin';
    }
    return organization?.id ?? 'global';
  }, [isAdmin, isOrganization, organization?.id]);

  const { fetchAnalytics } = useMcpClient({ analyticsOrgId });
  const analyticsData = (fetchAnalytics.data as AnalyticsData | undefined) ?? null;

  return (
    <ProtectedRoute>
      <RoleCheck allowedRoles={["organization", "admin"]}>
        <div className="min-h-screen bg-background">
          <NavigationWithNotifications />

          <main className="container mx-auto py-8 px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track user engagement, referrals, and document activity
              </p>
            </div>

            <Tabs defaultValue="custom">
              <TabsList className="mb-6">
                <TabsTrigger value="custom">Overview</TabsTrigger>
                {isAdmin && <TabsTrigger value="admin">Admin View</TabsTrigger>}
                {isOrganization && <TabsTrigger value="organization">Organization View</TabsTrigger>}
              </TabsList>

              <TabsContent value="custom">
                <CustomAnalytics
                  data={analyticsData}
                  isLoading={fetchAnalytics.isLoading}
                  error={fetchAnalytics.error}
                />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="admin">
                  <AdminAnalytics />
                </TabsContent>
              )}

              {isOrganization && organization && (
                <TabsContent value="organization">
                  <OrganizationAnalytics organization={organization} />
                </TabsContent>
              )}
            </Tabs>
          </main>
        </div>
      </RoleCheck>
    </ProtectedRoute>
  );
}
