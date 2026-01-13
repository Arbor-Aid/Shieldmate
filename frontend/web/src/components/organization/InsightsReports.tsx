
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization, Client } from "@/types/organization";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getClientTrends } from "@/services/organizationService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InsightsReportsProps {
  organization: Organization;
  clients: Client[];
}

export function InsightsReports({ organization, clients }: InsightsReportsProps) {
  const [timeframe, setTimeframe] = useState<string>("30days");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    async function fetchTrends() {
      try {
        if (organization?.id) {
          setIsLoading(true);
          const trends = await getClientTrends(organization.id, timeframe);
          setTrendData(trends);
        }
      } catch (error) {
        console.error("Error fetching client trends:", error);
        // Fallback to empty data
        setTrendData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTrends();
  }, [organization?.id, timeframe]);

  // Calculate some basic stats
  const activeClients = clients.filter(client => client.status.toLowerCase() === "active").length;
  const inactiveClients = clients.filter(client => client.status.toLowerCase() === "inactive").length;
  const pendingClients = clients.filter(client => client.status.toLowerCase() === "pending").length;

  // Most common service types
  const serviceTypes = clients.reduce((acc, client) => {
    const type = client.serviceType;
    if (!acc[type]) acc[type] = 0;
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);

  const serviceData = Object.entries(serviceTypes).map(([name, value]) => ({
    name,
    value
  }));

  // Most common needs
  const allNeeds: string[] = [];
  clients.forEach(client => {
    if (client.needs && Array.isArray(client.needs)) {
      allNeeds.push(...client.needs);
    }
  });
  
  const needsCount = allNeeds.reduce((acc, need) => {
    if (!acc[need]) acc[need] = 0;
    acc[need]++;
    return acc;
  }, {} as Record<string, number>);

  const needsData = Object.entries(needsCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Status distribution for pie chart
  const statusData = [
    { name: "Active", value: activeClients },
    { name: "Pending", value: pendingClients },
    { name: "Inactive", value: inactiveClients }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CardTitle>Insights & Reports</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Client Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {clients.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                No client data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Top Service Types</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {serviceData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                No service data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Top Client Needs</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {needsData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={needsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                No needs data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">Client Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px] text-muted-foreground">
              Loading trend data...
            </div>
          ) : trendData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newClients" name="New Clients" fill="#0088FE" />
                  <Bar dataKey="activeClients" name="Active Clients" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[300px] text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">Organization Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Organization Type</p>
              <p className="font-medium">{organization.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className={organization.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100"}>{organization.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Person</p>
              <p className="font-medium">{organization.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{new Date(organization.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
