
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { getAdminAnalytics } from "@/services/analyticsService";
import { AnalyticsData } from "@/types/analytics";
import { Users, FileText, GitPullRequest, CheckCircle, BarChart3 } from "lucide-react";

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        const data = await getAdminAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Failed to fetch admin analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAnalytics();
  }, []);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-80 bg-gray-200 animate-pulse rounded" />
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
              <p className="text-sm text-muted-foreground">New Users (30d)</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.newUsers}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.totalUsers > 0 
                  ? Math.round((analyticsData.newUsers / analyticsData.totalUsers) * 100)
                  : 0}% growth
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-700" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.totalDocuments}</h3>
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
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <h3 className="text-3xl font-bold mt-1">{analyticsData.totalReferrals}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Support requests made
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <GitPullRequest className="h-6 w-6 text-purple-700" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">User Engagement (14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.userEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0088FE" 
                  name="Active Users"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referrals by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Referrals by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.referralsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Document Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Document Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.documentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="uploads" 
                    stroke="#00C49F" 
                    name="Document Uploads"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Profile Completions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">Profile Completions</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-32 h-32">
              <CheckCircle className="w-32 h-32 text-green-500" />
              <span className="absolute text-3xl font-bold">
                {analyticsData.profileCompletions}
              </span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Completed profiles out of {analyticsData.totalUsers} total users
              ({analyticsData.totalUsers > 0 
                ? Math.round((analyticsData.profileCompletions / analyticsData.totalUsers) * 100) 
                : 0}%)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
