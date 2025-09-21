
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getAgentReports } from "@/services/adminService";
import { AgentReport } from "@/types/admin";
import { format } from "date-fns";
import { Eye, Filter } from "lucide-react";

export function AgentReports() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AgentReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { reports: newReports, lastDoc: newLastDoc } = await getAgentReports(lastDoc, 10);
      
      setReports(prev => [...prev, ...newReports]);
      setLastDoc(newLastDoc);
      setHasMore(newReports.length === 10);
    } catch (error) {
      console.error("Error loading AI reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "bg-blue-100 text-blue-800";
      case "reviewed": return "bg-green-100 text-green-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-pulse">Loading AI reports...</div>
                  </TableCell>
                </TableRow>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy") : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No AI agent reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={loadReports} 
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}

        {selectedReport && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-2">{selectedReport.title}</h2>
              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                  {selectedReport.category}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{selectedReport.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                Created on {format(new Date(selectedReport.createdAt), "PP p")}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
