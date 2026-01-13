
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationsList from "./ConversationsList";
import ConversationView from "./ConversationView";
import { Conversation } from "@/types/conversation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createConversation } from "@/services/conversationService";
import { useToast } from "@/hooks/use-toast";

export default function MyConversations() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const handleCreateNewConversation = async () => {
    if (!currentUser || isCreating) return;
    
    setIsCreating(true);
    
    try {
      const conversationId = await createConversation(currentUser.uid);
      const newConversation: Conversation = {
        id: conversationId,
        summary: "New conversation",
        lastUpdated: new Date(),
        createdAt: new Date(),
        tags: [],
        messages: [],
        userId: currentUser.uid
      };
      
      setSelectedConversation(newConversation);
      
      toast({
        title: "New conversation created",
        description: "You can now start chatting with the AI assistant."
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Conversations</h1>
        <Button onClick={handleCreateNewConversation} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>
      
      {selectedConversation ? (
        <ConversationView
          conversationId={selectedConversation.id}
          onBack={() => setSelectedConversation(null)}
        />
      ) : (
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All Conversations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-0">
            <ConversationsList onSelectConversation={setSelectedConversation} />
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <ConversationsList onSelectConversation={setSelectedConversation} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
