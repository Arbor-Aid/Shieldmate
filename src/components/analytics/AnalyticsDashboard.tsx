
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { trackEvent } from "@/lib/firebase";
import { Users, FileText, BookOpen, Upload, Activity } from "lucide-react";
import { getAnalyticsData } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        const data = await getAnalyticsData();
        setAnalyticsData(data);
        
        // Track analytics view event
        trackEvent('analytics_dashboard_viewed');
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAnalytics();
  }, []);
  
  // Colors for charts
  const COLORS = ['#9b87f5', '#7E69AB', '#33C3F0', '#1EAEDB', '#aaadb0'];
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-80 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.totalUsers}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.activeUsers} active users
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
              <p className="text-sm text-muted-foreground">Document Uploads</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.totalDocuments}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.documentUploadsRate}% increase
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Upload className="h-6 w-6 text-yellow-700" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resumes Generated</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.resumesGenerated}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.resumeGenerationRate}% of users
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="h-6 w-6 text-green-700" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Questionnaires</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.profileCompletions}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.questionnaireCompletionRate}% completion rate
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-purple-700" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={{
              users: { color: "#9b87f5", label: "Users" }
            }}>
              <LineChart data={analyticsData.userGrowth || analyticsData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="users"
                  stroke="#9b87f5" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Two Column Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Sessions (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ChartContainer config={{
                sessions: { color: "#33C3F0", label: "Sessions" }
              }}>
                <BarChart data={analyticsData.activeSessions || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="count" name="sessions" fill="#33C3F0" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Referral Sources (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ChartContainer config={{
                housing: { color: "#9b87f5" },
                employment: { color: "#33C3F0" },
                healthcare: { color: "#7E69AB" },
                benefits: { color: "#1EAEDB" },
                other: { color: "#aaadb0" }
              }}>
                <PieChart>
                  <Pie
                    data={analyticsData.referralsByType || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(analyticsData.referralsByType || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={{
              logins: { color: "#9b87f5", label: "Logins" },
              fileUploads: { color: "#33C3F0", label: "File Uploads" },
              resumeGens: { color: "#7E69AB", label: "Resume Generations" },
              aiPrompts: { color: "#1EAEDB", label: "AI Prompts" }
            }}>
              <LineChart data={analyticsData.activityMetrics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Line type="monotone" dataKey="logins" name="logins" stroke="#9b87f5" />
                <Line type="monotone" dataKey="fileUploads" name="fileUploads" stroke="#33C3F0" />
                <Line type="monotone" dataKey="resumeGens" name="resumeGens" stroke="#7E69AB" />
                <Line type="monotone" dataKey="aiPrompts" name="aiPrompts" stroke="#1EAEDB" />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
