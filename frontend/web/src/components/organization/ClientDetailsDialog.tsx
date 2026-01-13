
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { User, MessageSquare, FileText, Download, Clock, Mail, Phone, FileDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Client, ClientNote } from "@/types/organization";
import { addClientNote, updateClientStatus } from "@/services/organizationService";

interface ClientDetailsDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailsDialog({
  client,
  open,
  onOpenChange,
}: ClientDetailsDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [newStatus, setNewStatus] = useState(client.status);

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentUser) return;

    setIsSubmittingNote(true);

    try {
      const noteData: ClientNote = {
        id: uuidv4(),
        text: newNote.trim(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.displayName || currentUser.email || "Staff Member",
      };

      await addClientNote(client.id, noteData);

      toast({
        title: "Note added",
        description: "Your note has been added successfully.",
      });

      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Failed to add note",
        description: "There was an error adding your note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (status === client.status) return;

    try {
      await updateClientStatus(client.id, status);
      setNewStatus(status);

      toast({
        title: "Status updated",
        description: `Client status updated to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Failed to update status",
        description: "There was an error updating the client status.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{client.name}</DialogTitle>
          <DialogDescription>
            Client since {formatDate(client.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({client.notes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({client.documents?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.serviceType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm">{client.email}</p>
                    </div>
                  </div>

                  {client.phone && (
                    <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Last Contact</p>
                      <p className="text-sm">{formatDate(client.lastContact)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Status</CardTitle>
                  <CardDescription>Current status: {newStatus}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={newStatus === "Active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange("Active")}
                      >
                        Active
                      </Button>
                      <Button
                        variant={newStatus === "Pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange("Pending")}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={newStatus === "Completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange("Completed")}
                      >
                        Completed
                      </Button>
                      <Button
                        variant={newStatus === "Inactive" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange("Inactive")}
                      >
                        Inactive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {client.background && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{client.background}</p>
                  </CardContent>
                </Card>
              )}

              {client.needs && client.needs.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Needs Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {client.needs.map((need, index) => (
                        <Badge key={index} variant="secondary">{need}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Case Notes</CardTitle>
                <CardDescription>
                  Add and view notes about this client
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isSubmittingNote}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-4 pt-4">
                  {client.notes && client.notes.length > 0 ? (
                    client.notes
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((note) => (
                        <div
                          key={note.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">{note.createdBy}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-2">No notes yet</p>
                      <p className="text-sm">Add your first note above.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Client Documents</CardTitle>
                <CardDescription>
                  View and download documents uploaded by the client
                </CardDescription>
              </CardHeader>
              <CardContent>
                {client.documents && client.documents.length > 0 ? (
                  <div className="space-y-4">
                    {client.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded">
                            <FileText className="h-6 w-6 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded on {formatDate(doc.uploadedAt)} • {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileDown className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2">No documents available</p>
                    <p className="text-sm">
                      The client hasn't uploaded any documents yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
