
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { Message } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { queryOpenAI } from "@/services/aiAssistantService";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { getUserProfile } from "@/services/userProfileService";

const ChatAssistant = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRoleAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm here to help you find the resources you need. You can type or use voice commands. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");

        setNewMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Fetch user profile for context
    async function fetchUserContext() {
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
    }

    fetchUserContext();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentUser, userRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    window.speechSynthesis.cancel();
  };

  const speakMessage = (text: string) => {
    if (!isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Prepare system prompt with user context
      const systemPrompt = `You are an AI assistant for 2Marines, helping veterans access resources and support.
        ${userContext ? `\nUser Information:\n${userContext}` : ""}
        
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
        { role: "user", content: newMessage }
      ]);
      
      // Add AI response
      const assistantMessage: Message = {
        id: messages.length + 2,
        text: response,
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (isSpeaking) {
        speakMessage(assistantMessage.text);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      setMessages((prev) => [...prev, {
        id: messages.length + 2,
        text: "I'm sorry, I couldn't process your request right now. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`fixed bottom-4 right-4 shadow-xl transition-all duration-300 ${
      isMinimized ? 'w-64 h-14' : 'w-96 h-[500px]'
    } flex flex-col`}>
      <ChatHeader 
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
      />
      
      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                text={message.text}
                sender={message.sender}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <ChatInput
            newMessage={newMessage}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isLoading={isLoading}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onToggleListening={toggleListening}
            onToggleSpeaking={toggleSpeaking}
          />
        </>
      )}
    </Card>
  );
};

export default ChatAssistant;
