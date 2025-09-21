
import { useState, useCallback, useEffect } from "react";
import { queryOpenAI } from "@/services/aiAssistantService";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  flagged?: boolean;
  metadata?: {
    isAppointmentRequest?: boolean;
    isResumeBuilder?: boolean;
    isHousingAssistance?: boolean;
    isReferralReview?: boolean;
  };
}

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [flaggedMessages, setFlaggedMessages] = useState<Message[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { userRole } = useRoleAuth();

  const initialize = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 1,
        text: "Hello! I'm your 2Marines AI Assistant. How can I help you today?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!currentUser) {
        console.error("No current user");
        return;
      }

      setLoading(true);
      const newMessage: Message = { 
        id: Date.now(), 
        text: messageContent, 
        sender: "user", 
        timestamp: new Date() 
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      try {
        const systemPrompt = `You are an AI assistant for 2Marines, helping veterans access resources and support.
        
        You should provide helpful information about housing, employment, benefits, and mental health resources.
        If asked about specific services, provide general information and suggest connecting with a case manager.
        Be empathetic, supportive, and focus on practical next steps.`;
        
        // Get recent message history
        const recentMessages = messages.slice(-5).map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant" as "user" | "assistant",
          content: msg.text
        }));
        
        // Call OpenAI
        const response = await queryOpenAI([
          { role: "system", content: systemPrompt },
          ...recentMessages,
          { role: "user", content: messageContent }
        ]);
        
        // Add AI response
        const assistantMessage: Message = {
          id: Date.now(),
          text: response,
          sender: "assistant",
          timestamp: new Date(),
          flagged: Math.random() > 0.8 // Random flag for demonstration
        };
        
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        
        if (assistantMessage.flagged) {
          setFlaggedMessages(prev => [...prev, assistantMessage]);
        }
      } catch (error: any) {
        console.error("Error sending message to AI assistant:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to get response from AI assistant.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [currentUser, messages, toast, userRole]
  );

  const startAppointmentFlow = useCallback(() => {
    sendMessage("I need to schedule an appointment with a case manager.");
  }, [sendMessage]);

  const startResumeBuilder = useCallback(() => {
    sendMessage("I need help building my resume.");
  }, [sendMessage]);

  const startHousingAssistance = useCallback(() => {
    sendMessage("I need help with housing.");
  }, [sendMessage]);

  const startReferralReview = useCallback(() => {
    sendMessage("I need to review my referrals.");
  }, [sendMessage]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initialize();
    }
  }, [isOpen, messages.length, initialize]);

  return {
    messages,
    sendMessage,
    loading,
    isLoading: loading,
    isOpen,
    setIsOpen,
    initialize,
    flaggedMessages,
    startAppointmentFlow,
    startResumeBuilder,
    startHousingAssistance,
    startReferralReview
  };
};
