
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client } from "@/types/organization";
import { addClientNote, updateClientStatus } from "@/services/organizationService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Eye, FileText, Clock, Calendar, Tag, CalendarCheck } from "lucide-react";

interface ClientManagementProps {
  organizationId: string;
  clients: Client[];
}

export const ClientManagement = ({ organizationId, clients }: ClientManagementProps) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientNote, setClientNote] = useState("");
  const [viewProfile, setViewProfile] = useState(false);
  const { toast } = useToast();
  
  const handleAddNote = async (clientId: string) => {
    if (!clientNote.trim()) {
      toast({
        title: "Note Required",
        description: "Please enter a note before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      const note = {
        id: `note-${Date.now()}`,
        text: clientNote,
        createdAt: new Date().toISOString(),
        createdBy: "Current User", // Ideally replace with actual user name
      };
      
      await addClientNote(clientId, note);
      
      setClientNote("");
      toast({
        title: "Note Added",
        description: "Client note has been saved successfully",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      await updateClientStatus(clientId, newStatus);
      
      toast({
        title: "Status Updated",
        description: `Client status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Client Management
          </CardTitle>
          <CardDescription>
            Manage clients referred to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No clients assigned to your organization yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Needs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.serviceType}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={client.status}
                          onValueChange={(value) => handleStatusChange(client.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Complete">Complete</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(client.lastContact)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.needs?.map((need, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClient(client);
                              setViewProfile(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View Profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClient(client)}
                          >
                            <FileText className="h-4 w-4 mr-1" /> Notes
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Notes Dialog */}
      {selectedClient && !viewProfile && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Client Notes - {selectedClient.name}</DialogTitle>
              <DialogDescription>
                Add and review notes for this client
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="border rounded-md p-4 bg-muted/20">
                <h4 className="font-medium mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Client Background
                </h4>
                <p className="text-sm text-muted-foreground">{selectedClient.background || "No background information available."}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Add Note</h4>
                <Textarea
                  placeholder="Enter your notes about this client..."
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={() => handleAddNote(selectedClient.id)}
                  className="mt-2"
                >
                  Save Note
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Previous Notes</h4>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  {selectedClient.notes && selectedClient.notes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedClient.notes.map((note) => (
                        <div key={note.id} className="border-b pb-3 last:border-b-0">
                          <p className="text-sm">{note.text}</p>
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>{note.createdBy}</span>
                            <span>{formatDate(note.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No notes have been added yet.</p>
                  )}
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Profile Dialog */}
      {selectedClient && viewProfile && (
        <Dialog open={viewProfile} onOpenChange={() => setViewProfile(false)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Client Profile - {selectedClient.name}</DialogTitle>
              <DialogDescription>
                Detailed information about this client
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="needs">Needs Assessment</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedClient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedClient.phone || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedClient.status === "Active" ? "default" : "outline"}>
                          {selectedClient.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client Since:</span>
                        <span>{formatDate(selectedClient.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Contact:</span>
                        <span>{formatDate(selectedClient.lastContact)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referred On:</span>
                        <span>{formatDate(selectedClient.referredAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedClient.background || "No background information available."}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="needs" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Needs Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Service Needs</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedClient.needs?.map((need, i) => (
                            <Badge key={i} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedClient.documents && selectedClient.documents.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date Uploaded</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedClient.documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>{doc.name}</TableCell>
                              <TableCell>{doc.type}</TableCell>
                              <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                              <TableCell>{(doc.size / 1024).toFixed(1)} KB</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-sm">No documents have been uploaded yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                          <CalendarCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Client Created</h4>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedClient.createdAt)}</p>
                        </div>
                      </div>
                      
                      {selectedClient.referredAt && (
                        <div className="flex items-start gap-2">
                          <div className="bg-green-100 p-1 rounded-full mt-0.5">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Referred to Organization</h4>
                            <p className="text-xs text-muted-foreground">{formatDate(selectedClient.referredAt)}</p>
                            <p className="text-xs text-muted-foreground">{selectedClient.referredBy ? `By: ${selectedClient.referredBy}` : ''}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedClient.notes && selectedClient.notes.map((note) => (
                        <div key={note.id} className="flex items-start gap-2">
                          <div className="bg-gray-100 p-1 rounded-full mt-0.5">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Note Added</h4>
                            <p className="text-xs">{note.text.substring(0, 100)}{note.text.length > 100 ? '...' : ''}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(note.createdAt)} by {note.createdBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
