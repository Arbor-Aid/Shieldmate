
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { Calendar, Download, BarChart3, PieChart as PieChartIcon, Activity, FileText } from "lucide-react";
import { OrganizationAnalytics } from "./OrganizationAnalytics";
import { Organization } from "@/types/organization";
import html2pdf from "html2pdf.js";
import { trackEvent } from "@/lib/firebase";

interface OrganizationAnalyticsTabProps {
  organization: Organization;
}

export function OrganizationAnalyticsTab({ organization }: OrganizationAnalyticsTabProps) {
  const [timeframe, setTimeframe] = useState("month");
  
  const handleExportPDF = () => {
    // Track export event
    trackEvent("analytics_export_pdf", { organizationId: organization.id });
    
    const element = document.getElementById("analytics-container");
    const opt = {
      margin: 10,
      filename: `${organization.name.replace(/\s+/g, '-')}-analytics-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    if (element) {
      html2pdf().set(opt).from(element).save();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Organization Analytics</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              value={timeframe}
              onValueChange={(value) => {
                setTimeframe(value);
                trackEvent("analytics_timeframe_changed", { timeframe: value });
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 90 days</SelectItem>
                <SelectItem value="year">Last 365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </div>
      
      <div id="analytics-container">
        <OrganizationAnalytics organization={organization} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Analytics Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This dashboard displays analytics data gathered from users interacting with your organization. 
              Use the timeframe selector to adjust the date range for the displayed metrics.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-md bg-blue-50">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">User Metrics</h4>
                  <p className="text-xs text-muted-foreground">Track user growth and engagement</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-md bg-green-50">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Service Distribution</h4>
                  <p className="text-xs text-muted-foreground">Analyze service request patterns</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-md bg-purple-50">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Activity Trends</h4>
                  <p className="text-xs text-muted-foreground">Monitor user activity over time</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
