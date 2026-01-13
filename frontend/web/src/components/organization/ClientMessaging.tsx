
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Client } from "@/types/organization";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  createdAt: any;
  read: boolean;
}

interface ClientMessagingProps {
  organizationId: string;
  selectedClient: Client | null;
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

export function ClientMessaging({ 
  organizationId, 
  selectedClient, 
  clients,
  onSelectClient
}: ClientMessagingProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedClient || !currentUser) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("organizationId", "==", organizationId),
      where("clientId", "==", selectedClient.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: Message[] = [];
      
      snapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() } as Message);
      });
      
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [selectedClient, organizationId, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedClient || !currentUser) return;
    
    setLoading(true);
    
    try {
      await addDoc(collection(db, "messages"), {
        text: message.trim(),
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        organizationId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Organization Staff",
        receiverId: selectedClient.id,
        createdAt: serverTimestamp(),
        read: false
      });
      
      setMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the client"
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Client Messaging</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 h-full">
          {/* Client List */}
          <div className="border rounded-lg overflow-hidden md:col-span-1">
            <div className="p-3 bg-muted font-medium">Active Clients</div>
            <div className="p-2">
              <Input placeholder="Search clients..." className="mb-2" />
            </div>
            <div className="overflow-y-auto max-h-[400px]">
              {clients.filter(c => c.status.toLowerCase() === "active").length > 0 ? (
                clients
                  .filter(c => c.status.toLowerCase() === "active")
                  .map(client => (
                    <div 
                      key={client.id}
                      className={`p-3 cursor-pointer hover:bg-slate-50 ${selectedClient?.id === client.id ? 'bg-slate-100' : ''}`}
                      onClick={() => onSelectClient(client)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.serviceType}</p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No active clients found
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col h-full">
            {selectedClient ? (
              <>
                <div className="bg-muted p-3 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedClient.lastContact ? `Last contact: ${new Date(selectedClient.lastContact).toLocaleDateString()}` : 'New client'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 border-x min-h-[300px] max-h-[400px]">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.senderId === currentUser?.uid 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div className="flex items-center mt-1 text-xs opacity-70">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-3 border rounded-b-lg flex items-end">
                  <Textarea 
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 resize-none min-h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!message.trim() || loading}
                    className="ml-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-lg">
                <div className="text-center p-4">
                  <User className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2">Select a client to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
