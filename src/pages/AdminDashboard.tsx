
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { OrganizationsTable } from "@/components/admin/OrganizationsTable";
import { UserRolesTable } from "@/components/admin/UserRolesTable";
import { FeedbackFlags } from "@/components/admin/FeedbackFlags";
import { AgentReports } from "@/components/admin/AgentReports";
import { FlaggedMessagesReview } from "@/components/admin/FlaggedMessagesReview";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <a
          href="/admin/approvals"
          className="px-3 py-2 rounded border text-sm hover:bg-muted"
        >
          Approvals
        </a>
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
