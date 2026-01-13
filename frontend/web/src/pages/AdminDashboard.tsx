
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { OrganizationsTable } from "@/components/admin/OrganizationsTable";
import { UserRolesTable } from "@/components/admin/UserRolesTable";
import { FeedbackFlags } from "@/components/admin/FeedbackFlags";
import { AgentReports } from "@/components/admin/AgentReports";
import { FlaggedMessagesReview } from "@/components/admin/FlaggedMessagesReview";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { testGatewayHealth } from "@/services/mcpGateway";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin } = useRoleAuth();
  const [healthStatus, setHealthStatus] = useState<{
    state: "idle" | "checking" | "ok" | "error";
    message?: string;
    checkedAt?: string;
  }>({ state: "idle" });

  const handleTestGateway = async () => {
    setHealthStatus({ state: "checking" });
    try {
      const result = await testGatewayHealth();
      const checkedAt = new Date().toLocaleString();
      if (result.ok) {
        setHealthStatus({
          state: "ok",
          message: "MCP reachable",
          checkedAt,
        });
      } else {
        setHealthStatus({
          state: "error",
          message: `MCP returned ${result.status}`,
          checkedAt,
        });
      }
    } catch (error) {
      const checkedAt = new Date().toLocaleString();
      setHealthStatus({
        state: "error",
        message: error instanceof Error ? error.message : "MCP check failed",
        checkedAt,
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestGateway}
                disabled={healthStatus.state === "checking"}
                className="px-3 py-2 rounded border text-sm hover:bg-muted disabled:opacity-60"
              >
                {healthStatus.state === "checking"
                  ? "Testing MCP..."
                  : "Test MCP Connection"}
              </button>
              {healthStatus.state !== "idle" && (
                <div className="text-xs text-muted-foreground">
                  {healthStatus.message}
                  {healthStatus.checkedAt ? ` (${healthStatus.checkedAt})` : ""}
                </div>
              )}
            </div>
          )}
          <a
            href="/admin/approvals"
            className="px-3 py-2 rounded border text-sm hover:bg-muted"
          >
            Approvals
          </a>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">User Roles</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="agents">Agent Reports</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-4">
          <ClientsTable searchTerm={searchTerm} />
        </TabsContent>
        
        <TabsContent value="organizations" className="space-y-4">
          <OrganizationsTable searchTerm={searchTerm} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserRolesTable />
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <FeedbackFlags />
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4">
          <AgentReports />
        </TabsContent>
        
        <TabsContent value="flagged" className="space-y-4">
          <FlaggedMessagesReview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
