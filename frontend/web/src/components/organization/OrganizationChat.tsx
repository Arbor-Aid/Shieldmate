
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Loader2, MessageSquare as Bot, HelpCircle } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/firebase";
import { Organization } from "@/types/organization";
import { queryOpenAI } from "@/services/aiAssistantService";
import { getFallbackSuggestions } from "@/services/aiGuidanceService";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { PromptHelper } from "../chat/PromptHelper";
import { PromptSuggestion } from "../chat/PromptSuggestion";

interface OrganizationChatProps {
  organization: Organization;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function OrganizationChat({ organization }: OrganizationChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: `Hello! I'm your 2Marines AI assistant. I can help with client information, referrals, and support resources for ${organization.name}. How can I assist you today?`,
      sender: "assistant",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackSuggestions, setFallbackSuggestions] = useState<string[]>([]);
  
  const { currentUser } = useAuth();
  const { userRole } = useRoleAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setFallbackSuggestions(getFallbackSuggestions(null, userRole));
  }, [userRole]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (isLoading) return;
    
    if (!message.trim() || message.trim().length < 3) {
      setShowFallback(true);
      return;
    }
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setShowFallback(false);
    
    trackEvent("org_chat_message_sent", {
      orgId: organization.id,
      messageLength: message.length
    });
    
    try {
      const systemPrompt = `You are an AI assistant for ${organization.name}, a partner organization of 2Marines that helps veterans. 
      The organization focuses on providing support services to veterans in need.
      Organization ID: ${organization.id}
      Organization Type: ${organization.type || "Support Organization"}
      Active Clients: ${organization.clientCount || "multiple"}
      
      Answer questions about client management, referral processes, document handling, 
      and provide helpful information about veteran services. Keep responses concise and practical.
      If you don't know specific details about this organization, acknowledge that and provide general guidance.`;
      
      const response = await queryOpenAI([
        { role: "system", content: systemPrompt },
        ...messages.slice(-5).map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant" as "user" | "assistant",
          content: msg.text
        })),
        { role: "user", content: message }
      ]);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        text: response,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        sender: "assistant",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    handleSendMessage();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      setShowFallback(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Chat Assistant
          </CardTitle>
          <PromptHelper onSelectPrompt={(prompt) => {
            setMessage(prompt);
            handleSendMessage();
          }} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-md">
          <div className="space-y-4">
            {messages.length > 1 && messages.length < 4 && !isLoading && (
              <div className="mb-4">
                <PromptSuggestion 
                  onSelect={(prompt) => {
                    setMessage(prompt);
                    handleSendMessage();
                  }} 
                  maxSuggestions={2}
                />
              </div>
            )}
            
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-12' 
                      : 'bg-gray-100 text-gray-800 mr-12'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <p className="text-xs font-medium">
                      {msg.sender === 'user' ? currentUser?.displayName || 'You' : 'AI Assistant'}
                    </p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {showFallback && !isLoading && (
          <div className="mb-4">
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <HelpCircle className="h-3 w-3 mr-1" />
              <span>Try asking about:</span>
            </div>
            <div className="flex flex-col space-y-2">
              {fallbackSuggestions.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-start text-xs h-auto py-2 px-3"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
