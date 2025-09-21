
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getFeedbackFlags, updateFeedbackFlagStatus } from "@/services/adminService";
import { FeedbackFlag } from "@/types/admin";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function FeedbackFlags() {
  const [flags, setFlags] = useState<FeedbackFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const { flags: newFlags, lastDoc: newLastDoc } = await getFeedbackFlags(lastDoc, 10);
      
      setFlags(prev => [...prev, ...newFlags]);
      setLastDoc(newLastDoc);
      setHasMore(newFlags.length === 10);
    } catch (error) {
      console.error("Error loading feedback flags:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (flagId: string, status: "new" | "in-progress" | "resolved") => {
    try {
      const success = await updateFeedbackFlagStatus(flagId, status);
      
      if (success) {
        setFlags(prev => 
          prev.map(flag => 
            flag.id === flagId ? { ...flag, status } : flag
          )
        );
        
        toast({
          title: "Status Updated",
          description: `Flag status changed to ${status}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Could not update flag status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating flag status:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Flags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && flags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-pulse">Loading feedback and flags...</div>
                  </TableCell>
                </TableRow>
              ) : flags.length > 0 ? (
                flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-medium">{flag.organizationName}</TableCell>
                    <TableCell className="max-w-xs truncate">{flag.message}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(flag.priority)}`}>
                        {flag.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                        {flag.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {flag.createdAt ? format(new Date(flag.createdAt), "MMM d, yyyy") : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {flag.status === "new" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus(flag.id, "in-progress")}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            In Progress
                          </Button>
                        )}
                        
                        {flag.status !== "resolved" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus(flag.id, "resolved")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        
                        {flag.status === "resolved" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus(flag.id, "new")}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Reopen
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No feedback or flags found.
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
              onClick={loadFlags} 
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
