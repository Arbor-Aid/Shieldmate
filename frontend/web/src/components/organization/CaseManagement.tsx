
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  onSnapshot, 
  addDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client } from "@/types/organization";
import { User, Clock, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { createCaseStatusNotification } from "@/services/notificationService";

interface Case {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  createdAt: any;
  updatedAt: any;
  assignedTo?: string;
  organizationId: string;
}

interface CaseManagementProps {
  organizationId: string;
  clients: Client[];
}

export function CaseManagement({ organizationId, clients }: CaseManagementProps) {
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  
  useEffect(() => {
    if (!organizationId) return;
    
    // Create a query against the cases collection
    const casesQuery = query(
      collection(db, "supportCases"),
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(casesQuery, (snapshot) => {
      const caseList: Case[] = [];
      
      snapshot.forEach((doc) => {
        caseList.push({ id: doc.id, ...doc.data() } as Case);
      });
      
      setCases(caseList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching cases:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [organizationId]);

  const updateCaseStatus = async (caseId: string, newStatus: string) => {
    try {
      // Get the current case data to compare old status
      const caseRef = doc(db, "supportCases", caseId);
      const caseDoc = await getDoc(caseRef);
      
      if (!caseDoc.exists()) {
        throw new Error("Case not found");
      }
      
      const caseData = caseDoc.data() as Case;
      const oldStatus = caseData.status;
      
      // Only proceed if status is actually changing
      if (oldStatus === newStatus) return;
      
      // Update the case
      await updateDoc(caseRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Create notification for the client
      await createCaseStatusNotification(
        caseData.clientId,
        caseId,
        caseData.clientName,
        oldStatus,
        newStatus
      );
      
      toast({
        title: "Status Updated",
        description: `Case status changed to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating case status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update case status",
        variant: "destructive"
      });
    }
  };

  const getCaseStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case "in progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCasePriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Apply filters
  const filteredCases = cases.filter(c => {
    if (filterStatus !== "all" && c.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    
    if (filterPriority !== "all" && c.priority.toLowerCase() !== filterPriority.toLowerCase()) {
      return false;
    }
    
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Input placeholder="Search cases..." className="w-full sm:w-[240px]" />
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading cases...</p>
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="space-y-4">
            {filteredCases.map(supportCase => (
              <div key={supportCase.id} className="border rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{supportCase.clientName}</h4>
                      <div className="flex gap-2">
                        {getCaseStatusBadge(supportCase.status)}
                        {getCasePriorityBadge(supportCase.priority)}
                      </div>
                    </div>
                    
                    <p className="text-sm">
                      <span className="text-muted-foreground">Type:</span> {supportCase.type}
                    </p>
                    
                    <p className="text-sm">
                      <span className="text-muted-foreground">Description:</span> {supportCase.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Created: {formatTimestamp(supportCase.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>Updated: {formatTimestamp(supportCase.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateCaseStatus(supportCase.id, "In Progress")}
                      disabled={supportCase.status.toLowerCase() === "in progress"}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateCaseStatus(supportCase.id, "Resolved")}
                      disabled={supportCase.status.toLowerCase() === "resolved"}
                    >
                      Mark Resolved
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateCaseStatus(supportCase.id, "Closed")}
                      disabled={supportCase.status.toLowerCase() === "closed"}
                    >
                      Close Case
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2">No cases match your filters</p>
            <p className="text-sm text-muted-foreground">Try changing your filter settings or create a new case</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
