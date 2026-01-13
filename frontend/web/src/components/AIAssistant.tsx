
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, X, Send, AlertTriangle, Calendar, HelpCircle, FileText, Home, Briefcase } from "lucide-react";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { getContextualSuggestions, getFallbackSuggestions } from "@/services/aiGuidanceService";
import { useUserProfile } from "@/hooks/useUserProfile";
import SentimentIndicator from "./chat/SentimentIndicator";
import { PromptHelper } from "./chat/PromptHelper";
import { PromptSuggestion } from "./chat/PromptSuggestion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIAssistant() {
  const { 
    messages, 
    isLoading, 
    isOpen, 
    setIsOpen, 
    initialize, 
    sendMessage,
    flaggedMessages,
    startAppointmentFlow,
    startResumeBuilder,
    startHousingAssistance,
    startReferralReview
  } = useAIAssistant();
  
  const [inputText, setInputText] = useState("");
  const [fallbackSuggestions, setFallbackSuggestions] = useState<string[]>([]);
  const [showFallback, setShowFallback] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userRole } = useRoleAuth();
  const { profile } = useUserProfile();
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initialize();
    }
  }, [isOpen, messages.length, initialize]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    setFallbackSuggestions(getFallbackSuggestions(profile, userRole));
  }, [profile, userRole]);
  
  const handleSendMessage = () => {
    if (!inputText.trim() || inputText.trim().length < 3) {
      setShowFallback(true);
      return;
    }
    
    if (!isLoading) {
      sendMessage(inputText);
      setInputText("");
      setShowFallback(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
    setShowFallback(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (e.target.value.trim()) {
      setShowFallback(false);
    }
  };
  
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
        data-test-id="ai-assistant-button"
      >
        <MessageSquare className="mr-2" />
        AI Assistant
      </Button>
    );
  }
  
  // Render quick action buttons based on user role
  const renderQuickActions = () => {
    if (userRole === "client") {
      return (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={startResumeBuilder}
          >
            <FileText className="h-4 w-4" />
            Build Resume
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={startHousingAssistance}
          >
            <Home className="h-4 w-4" />
            Housing Help
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={startAppointmentFlow}
          >
            <Calendar className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      );
    } else if (userRole === "organization") {
      return (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={startReferralReview}
          >
            <Briefcase className="h-4 w-4" />
            Review Referrals
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => handleSuggestionClick("Generate summary of recent client activity")}
          >
            <FileText className="h-4 w-4" />
            Data Summary
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl flex flex-col z-50">
      <div className="flex justify-between items-center p-3 border-b bg-primary text-primary-foreground">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          <h3 className="font-medium">2Marines AI Assistant</h3>
        </div>
        <div className="flex gap-2">
          {userRole === 'client' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startAppointmentFlow}
                    className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary/80"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Schedule an appointment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <PromptHelper onSelectPrompt={handleSuggestionClick} />
          
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
      
      {userRole === "organization" && (
        <Tabs 
          defaultValue="chat"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="border-b px-3">
            <TabsList className="h-9 my-1">
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs">Referrals</TabsTrigger>
              <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      )}
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderQuickActions()}
        
        {messages.length === 0 && isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Initializing assistant...</p>
          </div>
        ) : (
          <>
            {messages.length > 0 && messages.length < 4 && !isLoading && (
              <div className="mb-4">
                <PromptSuggestion onSelect={handleSuggestionClick} maxSuggestions={2} />
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.metadata?.isAppointmentRequest
                      ? "bg-blue-100 border border-blue-200"
                      : message.metadata?.isResumeBuilder
                      ? "bg-green-100 border border-green-200"
                      : message.metadata?.isHousingAssistance
                      ? "bg-amber-100 border border-amber-200"
                      : message.metadata?.isReferralReview
                      ? "bg-purple-100 border border-purple-200"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center">
                    <p className="text-sm">{message.text}</p>
                    {message.sender === "assistant" && (
                      <div className="ml-2 flex items-center space-x-1">
                        {message.flagged && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">This message was flagged for sentiment review</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {message.flagged && (
                          <SentimentIndicator 
                            sentiment={message.flagged ? "negative" : "positive"} 
                            showDetails={true}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>
      
      {showFallback && !isLoading && (
        <div className="p-3 border-t">
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <HelpCircle className="h-3 w-3 mr-1" />
            <span>Try one of these:</span>
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
      
      <div className="p-4 border-t">
        <div className="flex">
          <Input
            placeholder="Type your message..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="mr-2"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
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
