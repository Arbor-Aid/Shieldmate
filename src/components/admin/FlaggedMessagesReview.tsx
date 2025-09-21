
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import SentimentIndicator from "../chat/SentimentIndicator";
import { SentimentAnalyticsView } from "./SentimentAnalyticsView";

export function FlaggedMessagesReview() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  useEffect(() => {
    loadFlaggedMessages();
  }, [activeTab]);

  const loadFlaggedMessages = async () => {
    setLoading(true);
    try {
      const messagesRef = collection(db, "flaggedMessages");
      const q = query(
        messagesRef,
        where("reviewed", "==", activeTab === "reviewed"),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading flagged messages:", error);
      toast({
        title: "Error",
        description: "Failed to load flagged messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (messageId: string) => {
    try {
      const messageRef = doc(db, "flaggedMessages", messageId);
      await updateDoc(messageRef, {
        reviewed: true,
        reviewedAt: new Date(),
        reviewDecision: "approved"
      });
      
      toast({
        title: "Message Approved",
        description: "The message has been marked as reviewed"
      });
      
      // Refresh the list
      loadFlaggedMessages();
    } catch (error) {
      console.error("Error approving message:", error);
      toast({
        title: "Error",
        description: "Failed to approve message",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <SentimentAnalyticsView />
      
      <Card>
        <CardHeader>
          <CardTitle>Flagged Messages Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="py-8 text-center">Loading...</div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {message.assistantType || "Unknown"} 
                        {message.sentiment && (
                          <span className="ml-2">
                            <SentimentIndicator 
                              sentiment={message.sentiment} 
                              score={message.score} 
                              confidence={message.confidence}
                              showDetails={true}
                            />
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {message.timestamp?.toDate().toLocaleString()}
                      </div>
                    </div>
                    <p className="my-2 bg-muted p-3 rounded-md">{message.message}</p>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApprove(message.id)}
                      >
                        Mark as Reviewed
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No pending messages to review
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviewed" className="space-y-4">
              {loading ? (
                <div className="py-8 text-center">Loading...</div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {message.assistantType || "Unknown"}
                        {message.sentiment && (
                          <span className="ml-2">
                            <SentimentIndicator 
                              sentiment={message.sentiment} 
                              score={message.score} 
                              confidence={message.confidence}
                              showDetails={true}
                            />
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {message.timestamp?.toDate().toLocaleString()}
                      </div>
                    </div>
                    <p className="my-2 bg-muted p-3 rounded-md">{message.message}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Reviewed: {message.reviewedAt?.toDate().toLocaleString() || "Unknown"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No reviewed messages to display
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
