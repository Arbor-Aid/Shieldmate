
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Organization, Client } from "@/types/organization";
import { getSupportCasesCount, getDocumentsCount } from "@/services/organizationService";
import { BarChart3, Users, FileText, HelpCircle, Clock } from "lucide-react";

interface DashboardSummaryProps {
  organization: Organization;
  clients: Client[];
}

export function DashboardSummary({ organization, clients }: DashboardSummaryProps) {
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [supportCasesCount, setSupportCasesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        if (organization?.id) {
          setIsLoading(true);
          // Fetch documents count
          const docsCount = await getDocumentsCount(organization.id);
          setDocumentsCount(docsCount);
          
          // Fetch support cases count
          const casesCount = await getSupportCasesCount(organization.id);
          setSupportCasesCount(casesCount);
        }
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCounts();
  }, [organization?.id]);

  // Calculate active clients
  const activeClients = clients.filter(client => client.status.toLowerCase() === "active").length;
  
  // Calculate recent clients (added in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentClients = clients.filter(client => {
    const createdDate = new Date(client.createdAt);
    return createdDate > thirtyDaysAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <h3 className="text-3xl font-bold mt-1">{clients.length}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClients} active clients
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-700" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">New Clients (30d)</p>
            <h3 className="text-3xl font-bold mt-1">{recentClients}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((recentClients / clients.length) * 100) || 0}% growth
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Clock className="h-6 w-6 text-green-700" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Documents</p>
            <h3 className="text-3xl font-bold mt-1">
              {isLoading ? "..." : documentsCount}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Uploaded files & records
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <FileText className="h-6 w-6 text-yellow-700" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Open Cases</p>
            <h3 className="text-3xl font-bold mt-1">
              {isLoading ? "..." : supportCasesCount}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Active support requests
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <HelpCircle className="h-6 w-6 text-purple-700" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
