
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { OrganizationAnalytics } from "@/components/organization/OrganizationAnalytics";
import { AnalyticsDashboard as CustomAnalytics } from "@/components/analytics/AnalyticsDashboard";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { trackEvent } from "@/lib/firebase";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleCheck from "@/components/RoleCheck";

export default function AnalyticsDashboard() {
  const { userRole, isAdmin, isOrganization } = useRoleAuth();
  const { organization } = useOrganization();
  
  useEffect(() => {
    // Track page view
    trackEvent('analytics_dashboard_page_view', { userRole });
  }, [userRole]);

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
                <CustomAnalytics />
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
