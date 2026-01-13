import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  getConversation,
  addMessageToConversation,
  updateConversationTags
} from "@/services/conversationService";
import { Conversation, ConversationMessage } from "@/types/conversation";
import { Loader2, Tag, Send, ArrowLeft, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { queryOpenAI } from "@/services/aiAssistantService";
import { format } from "date-fns";
import { trackEvent } from "@/lib/firebase";

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

export default function ConversationView({ conversationId, onBack }: ConversationViewProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    async function loadConversation() {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const conversationData = await getConversation(currentUser.uid, conversationId);
        setConversation(conversationData);
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadConversation();
  }, [currentUser, conversationId, toast]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);
  
  const handleSendMessage = async () => {
    if (!currentUser || !conversation || !message.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      // Add user message
      const userMessage: Omit<ConversationMessage, "id"> = {
        text: message,
        sender: "user",
        timestamp: new Date()
      };
      
      await addMessageToConversation(currentUser.uid, conversationId, userMessage);
      
      // Prepare message for AI
      const recentMessages = [
        ...(conversation.messages || []).slice(-5),
        { ...userMessage, id: "temp-id" }
      ];
      
      const messages = recentMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant" as "user" | "assistant",
        content: msg.text
      }));
      
      // Update local state with user message
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, { ...userMessage, id: `temp-${Date.now()}` }]
        };
      });
      
      setMessage("");
      
      // Get AI response
      const response = await queryOpenAI([
        { role: "system", content: "You are a helpful AI assistant for 2Marines, focused on providing support for veterans. Be concise, respectful, and solution-oriented." },
        ...messages
      ]);
      
      // Add AI response to conversation
      const assistantMessage: Omit<ConversationMessage, "id"> = {
        text: response,
        sender: "assistant",
        timestamp: new Date()
      };
      
      await addMessageToConversation(currentUser.uid, conversationId, assistantMessage);
      
      // Update local state with AI response
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, { ...assistantMessage, id: `temp-${Date.now()}` }]
        };
      });
      
      trackEvent("conversation_continued", { 
        conversationId,
        messageCount: conversation.messages.length + 2 
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleAddTag = async () => {
    if (!currentUser || !conversation || !newTag.trim()) return;
    
    try {
      const updatedTags = [...(conversation.tags || []), newTag.trim()];
      await updateConversationTags(currentUser.uid, conversationId, updatedTags);
      
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: updatedTags
        };
      });
      
      setNewTag("");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveTag = async (tagToRemove: string) => {
    if (!currentUser || !conversation) return;
    
    try {
      const updatedTags = conversation.tags.filter(tag => tag !== tagToRemove);
      await updateConversationTags(currentUser.uid, conversationId, updatedTags);
      
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: updatedTags
        };
      });
    } catch (error) {
      console.error("Error removing tag:", error);
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }
  
  if (!conversation) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">Conversation not found</h3>
        <Button onClick={onBack}>Back to conversations</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">{conversation.summary}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setEditingTags(!editingTags)}
          >
            {editingTags ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <span>
            {format(conversation.createdAt, "MMM d, yyyy")}
          </span>
          <span className="mx-2">•</span>
          <span>{conversation.messages.length} messages</span>
        </div>
        
        {/* Tags section */}
        <div className="mt-3">
          {editingTags ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingTags(false)}>
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {conversation.tags.length > 0 ? (
                conversation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    {editingTags && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No tags</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {format(message.timestamp, "h:mm a")}
              </p>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-muted flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="mr-2"
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
