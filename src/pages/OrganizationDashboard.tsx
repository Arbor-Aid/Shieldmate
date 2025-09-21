
import React, { useState } from "react";
import OrganizationRoute from "@/components/OrganizationRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSummary } from "@/components/organization/DashboardSummary";
import { ClientManagement } from "@/components/organization/ClientManagement";
import { ReferralTracking } from "@/components/organization/ReferralTracking";
import { OrganizationChat } from "@/components/organization/OrganizationChat";
import { OrganizationFiles } from "@/components/organization/OrganizationFiles";
import { OrganizationAnalyticsTab } from "@/components/organization/OrganizationAnalyticsTab";
import { PendingMatches } from "@/components/organization/PendingMatches";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { getOrganizationPendingMatches } from "@/services/organizationMatchService";

const OrganizationDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { organization, clients } = useOrganization();
  const { toast } = useToast();
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0);

  React.useEffect(() => {
    const checkPendingMatches = async () => {
      if (!organization?.id) return;
      
      try {
        const pendingMatches = await getOrganizationPendingMatches(organization.id);
        setPendingMatchesCount(pendingMatches.length);
        
        // Show a toast notification if there are pending matches
        if (pendingMatches.length > 0 && activeTab !== "matches") {
          toast({
            title: "New Client Matches",
            description: `You have ${pendingMatches.length} new potential clients that match your services.`,
            action: (
              <button 
                onClick={() => setActiveTab("matches")}
                className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs"
              >
                View
              </button>
            ),
          });
        }
      } catch (error) {
        console.error("Error checking pending matches:", error);
      }
    };
    
    checkPendingMatches();
    
    // Check for new matches every 5 minutes
    const interval = setInterval(checkPendingMatches, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [organization?.id, toast, activeTab]);

  return (
    <OrganizationRoute>
      <div className="container mx-auto py-6 space-y-8">
        <h1 className="text-3xl font-bold">Organization Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="matches" className="relative">
              Matches
              {pendingMatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingMatchesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <DashboardSummary organization={organization} clients={clients} />
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-6">
            <ClientManagement organizationId={organization?.id || ''} clients={clients} />
          </TabsContent>
          
          <TabsContent value="referrals" className="space-y-6">
            <ReferralTracking organizationId={organization?.id || ''} />
          </TabsContent>
          
          <TabsContent value="matches" className="space-y-6">
            <PendingMatches />
          </TabsContent>
          
          <TabsContent value="messaging" className="space-y-6">
            <OrganizationChat organization={organization} />
          </TabsContent>
          
          <TabsContent value="files" className="space-y-6">
            <OrganizationFiles organization={organization} />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <OrganizationAnalyticsTab organization={organization} />
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationRoute>
  );
};

export default OrganizationDashboard;
