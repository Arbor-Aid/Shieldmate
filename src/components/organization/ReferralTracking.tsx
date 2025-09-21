
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Referral } from "@/types/organization";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";

interface ReferralTrackingProps {
  organizationId: string;
  referrals?: Referral[];
}

export function ReferralTracking({ organizationId, referrals = [] }: ReferralTrackingProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [processingReferralId, setProcessingReferralId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [noteText, setNoteText] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  
  const getReferralStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "active") {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (statusLower === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else if (statusLower === "completed") {
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "active") {
      return <Clock className="h-4 w-4 text-green-600" />;
    } else if (statusLower === "pending") {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    } else if (statusLower === "completed") {
      return <CheckCircle className="h-4 w-4 text-blue-600" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const updateReferralStatus = async (referralId: string, newStatus: string) => {
    setIsLoading(true);
    setProcessingReferralId(referralId);
    
    try {
      const referralRef = doc(db, "referrals", referralId);
      await updateDoc(referralRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Also update the client status if applicable
      const referral = referrals.find(r => r.id === referralId);
      if (referral?.clientId) {
        const clientRef = doc(db, "clients", referral.clientId);
        await updateDoc(clientRef, {
          status: newStatus === "Completed" ? "Serviced" : "Active",
          lastContact: new Date().toISOString()
        });
      }
      
      toast({
        title: "Status Updated",
        description: `Referral status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating referral status:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the referral status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingReferralId(null);
    }
  };

  const addNoteToReferral = async () => {
    if (!selectedReferral || !noteText.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Add note to referral notes collection
      await addDoc(collection(db, "referralNotes"), {
        referralId: selectedReferral.id,
        clientId: selectedReferral.clientId,
        text: noteText.trim(),
        createdAt: serverTimestamp(),
        createdBy: "Staff", // Replace with actual user name
        organizationId
      });
      
      // Update the referral last activity
      const referralRef = doc(db, "referrals", selectedReferral.id);
      await updateDoc(referralRef, {
        lastActivity: new Date().toISOString()
      });
      
      toast({
        title: "Note Added",
        description: "Your note has been added to this referral"
      });
      
      // Clear the form
      setNoteText("");
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Failed to Add Note",
        description: "There was a problem adding your note",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferrals = filterStatus === "all" 
    ? referrals 
    : referrals.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Referral List</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedReferral}>
              Referral Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <div className="mb-4 flex flex-col sm:flex-row justify-between gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Referrals</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Input 
                placeholder="Search referrals..." 
                className="w-full sm:w-[240px]" 
              />
            </div>
            
            {filteredReferrals.length > 0 ? (
              <div className="space-y-6">
                {filteredReferrals.map((referral) => (
                  <div 
                    key={referral.id} 
                    className="flex flex-col md:flex-row justify-between border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedReferral(referral)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(referral.status)}
                        <h4 className="font-medium">{referral.clientName}</h4>
                        {getReferralStatusBadge(referral.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Referred on {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                      {referral.notes && (
                        <p className="text-sm">
                          Notes: {referral.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isLoading || referral.status.toLowerCase() === "completed" || processingReferralId === referral.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateReferralStatus(referral.id, "Completed");
                        }}
                      >
                        {processingReferralId === referral.id ? "Updating..." : "Mark Completed"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Copy client contact details if available
                          if (referral.clientId) {
                            navigator.clipboard.writeText(`Client ID: ${referral.clientId}, Name: ${referral.clientName}`);
                          }
                          
                          toast({
                            title: "Contact Client",
                            description: "Client information copied to clipboard",
                          });
                        }}
                      >
                        Contact Client
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No active referrals at this time.</p>
                <Button variant="outline">View Past Referrals</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="detail">
            {selectedReferral && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Referral: {selectedReferral.clientName}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedReferral(null)}
                  >
                    Back to List
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Referral Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getReferralStatusBadge(selectedReferral.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedReferral.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedReferral.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span>{new Date(selectedReferral.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client ID:</span>
                        <span>{selectedReferral.clientId || "Not Available"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Change Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={selectedReferral.status.toLowerCase() === "active" ? "default" : "outline"} 
                        size="sm"
                        disabled={isLoading || selectedReferral.status.toLowerCase() === "active"}
                        onClick={() => updateReferralStatus(selectedReferral.id, "Active")}
                      >
                        Active
                      </Button>
                      <Button 
                        variant={selectedReferral.status.toLowerCase() === "pending" ? "default" : "outline"} 
                        size="sm"
                        disabled={isLoading || selectedReferral.status.toLowerCase() === "pending"}
                        onClick={() => updateReferralStatus(selectedReferral.id, "Pending")}
                      >
                        Pending
                      </Button>
                      <Button 
                        variant={selectedReferral.status.toLowerCase() === "completed" ? "default" : "outline"} 
                        size="sm"
                        disabled={isLoading || selectedReferral.status.toLowerCase() === "completed"}
                        onClick={() => updateReferralStatus(selectedReferral.id, "Completed")}
                      >
                        Completed
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Add Note</h4>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Add details, updates, or notes about this referral..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={addNoteToReferral}
                      disabled={!noteText.trim() || isLoading}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>
                
                {/* Messages History (placeholder) */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Communication History</h4>
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No messages available for this referral.</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
