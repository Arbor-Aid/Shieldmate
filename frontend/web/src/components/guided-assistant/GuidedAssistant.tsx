
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, X, Send, HelpCircle } from "lucide-react";
import { useGuidedAssistant } from "@/hooks/useGuidedAssistant";
import GuidedChatMessage from "./GuidedChatMessage";
import SuggestionChips from "./SuggestionChips";
import { PromptHelper } from "../chat/PromptHelper";
import { PromptSuggestion } from "../chat/PromptSuggestion";
import { useAuth } from "@/hooks/useAuth";
import { createConversation, addMessageToConversation, updateConversation } from "@/services/conversationService";

export default function GuidedAssistant() {
  const { 
    messages, 
    isLoading, 
    isOpen, 
    setIsOpen, 
    sendMessage,
    activeSuggestions,
    selectSuggestion
  } = useGuidedAssistant();
  
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Create a new conversation when the chat is opened
  useEffect(() => {
    const initializeConversation = async () => {
      if (isOpen && currentUser && !conversationId && messages.length > 0) {
        try {
          // Create new conversation in Firestore
          const newConversationId = await createConversation(currentUser.uid, "AI Assistant Chat");
          setConversationId(newConversationId);
          
          // Add initial assistant message to the conversation
          const welcomeMessage = messages[0];
          if (welcomeMessage && welcomeMessage.sender === "assistant") {
            await addMessageToConversation(currentUser.uid, newConversationId, {
              text: welcomeMessage.text,
              sender: "assistant",
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error("Error initializing conversation:", error);
        }
      }
    };
    
    initializeConversation();
  }, [isOpen, currentUser, conversationId, messages]);
  
  // Save new messages to Firestore
  useEffect(() => {
    const saveMessageToFirestore = async () => {
      if (!currentUser || !conversationId || messages.length <= 1) return;
      
      const lastMessage = messages[messages.length - 1];
      
      try {
        await addMessageToConversation(currentUser.uid, conversationId, {
          text: lastMessage.text,
          sender: lastMessage.sender,
          timestamp: lastMessage.timestamp
        });
        
        // Update conversation summary based on first few messages
        if (messages.length <= 3 && messages.some(m => m.sender === "user")) {
          const userMessages = messages.filter(m => m.sender === "user");
          if (userMessages.length > 0) {
            const summary = userMessages[0].text.length > 50 
              ? userMessages[0].text.substring(0, 47) + "..."
              : userMessages[0].text;
              
            await updateConversation(currentUser.uid, conversationId, { summary });
          }
        }
      } catch (error) {
        console.error("Error saving message to Firestore:", error);
      }
    };
    
    saveMessageToFirestore();
  }, [messages, currentUser, conversationId]);
  
  const handleSendMessage = () => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText);
      setInputText("");
    }
  };
  
  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg"
        size="lg"
        data-test-id="guided-assistant-button"
      >
        <MessageSquare className="mr-2" />
        AI Assistant
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-primary text-primary-foreground">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          <h3 className="font-medium">2Marines AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <PromptHelper onSelectPrompt={selectSuggestion} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Initializing assistant...</p>
          </div>
        ) : (
          <>
            {/* Display prompt suggestions at the top if there are messages but not too many */}
            {messages.length > 0 && messages.length < 4 && !isLoading && (
              <div className="mb-4">
                <PromptSuggestion onSelect={selectSuggestion} maxSuggestions={2} />
              </div>
            )}
            
            {messages.map((message) => (
              <GuidedChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={selectSuggestion}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>
      
      {/* Suggestion chips */}
      {activeSuggestions.length > 0 && !isLoading && (
        <div className="px-4 border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            Try asking:
          </p>
          <SuggestionChips
            suggestions={activeSuggestions}
            onSelect={selectSuggestion}
            disabled={isLoading}
          />
        </div>
      )}
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="mr-2"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            size="icon"
            className="rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
