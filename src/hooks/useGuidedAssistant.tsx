import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRoleAuth } from "./useRoleAuth";
import { useAuth } from "@/hooks/useAuth";
import { getGuidancePrompts, getContextualSuggestions, needsHumanEscalation, MessageContext } from "@/services/aiGuidanceService";
import { queryOpenAI } from "@/services/aiAssistantService";
import { trackEvent } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { analyzeSentiment } from "@/services/sentimentAnalysisService";
import { getUserProfile } from "@/services/userProfileService";
import { generateResumeFromProfile } from "@/services/resumeService";
import { Button } from "@/components/ui/button";

export interface AssistantMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  suggestions?: string[];
  sentiment?: "positive" | "neutral" | "negative";
  sentimentScore?: number;
  confidence?: number;
  flagged?: boolean;
  needsHumanEscalation?: boolean;
  escalationReason?: string;
  category?: "general" | "resume" | "housing" | "appointment" | "benefits";
}

export function useGuidedAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const { userRole } = useRoleAuth();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [needsEscalation, setNeedsEscalation] = useState(false);
  const [userContext, setUserContext] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid && userRole === "client") {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            let context = "";
            if (profile.firstName) context += `Name: ${profile.firstName} ${profile.lastName || ""}\n`;
            if (profile.branch) context += `Military Branch: ${profile.branch}\n`;
            if (profile.serviceYears) context += `Service Years: ${profile.serviceYears}\n`;
            if (profile.needsAssistance && profile.needsAssistance.length > 0) {
              context += `Needs Assistance With: ${profile.needsAssistance.join(", ")}\n`;
            }
            setUserContext(context);
          }
        } catch (error) {
          console.error("Error fetching user context:", error);
        }
      }
    };
    
    fetchUserProfile();
  }, [currentUser, userRole]);

  const initialize = useCallback(async () => {
    if (messages.length === 0) {
      setIsLoading(true);
      
      try {
        const initialSuggestions = getGuidancePrompts(userRole).slice(0, 4);
        
        let welcomeText = "Hello! I'm your 2Marines AI Assistant. How can I help you today?";
        
        if (userRole === "client") {
          welcomeText = "Welcome! I'm your 2Marines AI Assistant. I can help you find housing, employment, benefits information, and other support services. What can I assist you with today?";
        } else if (userRole === "organization") {
          welcomeText = "Hello! I'm your 2Marines AI Assistant. I can help you manage referrals, find resources for your clients, and connect with other support services. How can I assist you today?";
        } else if (userRole === "admin") {
          welcomeText = "Welcome, admin! I'm your 2Marines AI Assistant. I can help you with system analytics, user management, and organization oversight. What would you like to know?";
        }
        
        setMessages([{
          id: "welcome",
          text: welcomeText,
          sender: "assistant",
          timestamp: new Date(),
          suggestions: initialSuggestions,
          sentiment: "positive"
        }]);
        
        setActiveSuggestions(initialSuggestions);
        
        if (currentUser) {
          trackEvent("ai_assistant_opened", {
            userId: currentUser.uid,
            userRole: userRole || "unknown",
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Error initializing assistant:", error);
        toast({
          title: "Error",
          description: "Couldn't initialize the assistant. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser, messages.length, toast, userRole]);

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const newSuggestions = getContextualSuggestions(
        messages.map(m => ({ text: m.text, sender: m.sender })),
        userRole
      );
      setActiveSuggestions(newSuggestions);
      
      const escalationCheck = needsHumanEscalation(
        messages.map(m => ({ text: m.text, sender: m.sender }))
      );
      
      setNeedsEscalation(escalationCheck.needsEscalation);
      
      if (escalationCheck.needsEscalation && !needsEscalation) {
        toast({
          title: "Would you like to speak with a human?",
          description: "This conversation might benefit from human assistance. Would you like to be connected to a support agent?",
          action: (
            <div className="flex gap-2 mt-2">
              <Button variant="default" onClick={() => handleEscalateToHuman()}>
                Yes, connect me
              </Button>
              <Button variant="outline" onClick={() => setNeedsEscalation(false)}>
                No, continue with AI
              </Button>
            </div>
          )
        });
      }
    }
  }, [messages, isLoading, userRole]);

  const handleEscalateToHuman = () => {
    const escalationMessage: AssistantMessage = {
      id: `system-${Date.now()}`,
      text: "I've notified our support team, and someone will contact you soon. In the meantime, feel free to continue our conversation, and I'll assist as best I can.",
      sender: "assistant",
      timestamp: new Date(),
      sentiment: "positive"
    };
    
    setMessages(prev => [...prev, escalationMessage]);
    
    if (currentUser) {
      trackEvent("conversation_escalated_to_human", {
        userId: currentUser.uid,
        conversationLength: messages.length,
        timestamp: new Date().toISOString()
      });
    }
  };

  const detectMessageCategory = (text: string): "general" | "resume" | "housing" | "appointment" | "benefits" => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("resume") || lowerText.includes("cv") || lowerText.includes("job") || 
        lowerText.includes("employment") || lowerText.includes("career")) {
      return "resume";
    }
    
    if (lowerText.includes("housing") || lowerText.includes("home") || lowerText.includes("apartment") || 
        lowerText.includes("rent") || lowerText.includes("homeless")) {
      return "housing";
    }
    
    if (lowerText.includes("appointment") || lowerText.includes("schedule") || lowerText.includes("meet") || 
        lowerText.includes("meeting")) {
      return "appointment";
    }
    
    if (lowerText.includes("benefit") || lowerText.includes("va ") || lowerText.includes("veteran affairs") || 
        lowerText.includes("disability") || lowerText.includes("compensation")) {
      return "benefits";
    }
    
    return "general";
  };

  const handleResumeAssistance = async (userMessage: string) => {
    if (!currentUser) return null;
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        const resumeData = await generateResumeFromProfile(profile);
        
        return `Based on your profile information, I've created a basic resume outline for you:\n\n` +
               `**Contact Information:**\n` +
               `${resumeData.contactInfo.fullName}\n` +
               `${resumeData.contactInfo.email}\n` +
               `${resumeData.contactInfo.phone}\n\n` +
               `**Summary:**\n${resumeData.summary}\n\n` +
               `**Military Experience:**\n${resumeData.militaryExperience.branch || "Not specified"}\n` +
               `${resumeData.militaryExperience.serviceYears || ""}\n\n` +
               `**Skills:**\n${resumeData.skills.join(", ")}\n\n` +
               `Would you like me to help you expand on any specific section of your resume? Or would you like guidance on translating your military skills to civilian terms?`;
      }
    } catch (error) {
      console.error("Error generating resume assistance:", error);
    }
    
    return null;
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: new Date(),
      category: detectMessageCategory(text)
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      let specialResponse = null;
      if (userMessage.category === "resume") {
        specialResponse = await handleResumeAssistance(text);
      }
      
      let systemPrompt = "You are a helpful assistant for veterans seeking support services.";
      
      if (userContext) {
        systemPrompt += `\n\nUser Information:\n${userContext}`;
      }
      
      if (userRole === "client") {
        systemPrompt = "You are a supportive assistant for veterans. Provide clear, compassionate guidance about housing, employment, VA benefits, and mental health resources. If the user seems uncertain, suggest specific resources they might need.";
        
        if (userMessage.category === "housing") {
          systemPrompt += "\n\nThe user is asking about housing assistance. Provide information about veteran housing resources, VA home loans, emergency housing options, and housing subsidies. Suggest local housing assistance programs when possible.";
        } else if (userMessage.category === "appointment") {
          systemPrompt += "\n\nThe user wants to schedule an appointment. Help collect relevant information like preferred date, time, purpose of the meeting, and any specific requirements. Guide them through the scheduling process.";
        }
      } else if (userRole === "organization") {
        systemPrompt = "You are an assistant for organizations supporting veterans. Provide information about case management, referral processes, and available resources. Help organizations better serve their veteran clients.";
      } else if (userRole === "admin") {
        systemPrompt = "You are an assistant for 2Marines administrators. Provide insights about system performance, user activity, and organization management. Help admins make data-driven decisions.";
      }
      
      systemPrompt += "\n\nAlways respond with empathy and understanding. Focus on practical next steps and actionable advice. If the user seems to be in crisis or needs immediate help, suggest connecting with a human support representative.";
      
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant" as "user" | "assistant",
        content: msg.text
      }));
      
      const aiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...recentMessages,
        { role: "user" as const, content: text }
      ];
      
      const response = specialResponse || await queryOpenAI(aiMessages);
      
      const sentimentResult = analyzeSentiment(response);
      
      const messagesToUse: MessageContext[] = [
        ...messages.map(m => ({
          text: m.text,
          sender: m.sender 
        })), 
        { text: userMessage.text, sender: userMessage.sender },
        { text: response, sender: "assistant" as const }
      ];
      
      const suggestions = getContextualSuggestions(messagesToUse, userRole);
      
      const escalationCheck = needsHumanEscalation(messagesToUse);
      
      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        text: response,
        sender: "assistant",
        timestamp: new Date(),
        suggestions,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        confidence: sentimentResult.confidence,
        flagged: sentimentResult.sentiment === 'negative',
        needsHumanEscalation: escalationCheck.needsEscalation,
        escalationReason: escalationCheck.reason,
        category: detectMessageCategory(response)
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setActiveSuggestions(suggestions);
      
      if (escalationCheck.needsEscalation) {
        setNeedsEscalation(true);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Couldn't get a response. Please try again.",
        variant: "destructive",
      });
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: "assistant",
        timestamp: new Date(),
        sentiment: "neutral"
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, messages, toast, userRole, userContext]);

  const selectSuggestion = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  useEffect(() => {
    if (isOpen) {
      initialize();
    }
  }, [isOpen, initialize]);

  return {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    activeSuggestions,
    selectSuggestion,
    needsEscalation,
    handleEscalateToHuman
  };
}
