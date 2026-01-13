
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getUserConversations, deleteConversation } from "@/services/conversationService";
import { Conversation } from "@/types/conversation";
import { Loader2, Trash2, MessageSquare, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationsList({ onSelectConversation }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadConversations() {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userConversations = await getUserConversations(currentUser.uid);
        setConversations(userConversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadConversations();
  }, [currentUser, toast]);
  
  const handleDeleteClick = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!currentUser || !conversationToDelete) return;
    
    try {
      await deleteConversation(currentUser.uid, conversationToDelete.id);
      
      setConversations(prev => 
        prev.filter(conv => conv.id !== conversationToDelete.id)
      );
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="text-center p-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-muted-foreground mb-4">
          Start a new chat with the AI assistant to begin your first conversation.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Card 
          key={conversation.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onSelectConversation(conversation)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">{conversation.summary}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => handleDeleteClick(conversation, e)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {format(conversation.lastUpdated, "MMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </CardHeader>
          
          {conversation.tags && conversation.tags.length > 0 && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {conversation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
