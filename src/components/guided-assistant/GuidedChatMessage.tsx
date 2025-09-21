
import { AssistantMessage } from "@/hooks/useGuidedAssistant";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SentimentIndicator from "../chat/SentimentIndicator";

interface GuidedChatMessageProps {
  message: AssistantMessage;
  onSuggestionClick: (suggestion: string) => void;
}

export default function GuidedChatMessage({ message, onSuggestionClick }: GuidedChatMessageProps) {
  // Detect if message contains appointment info or resume data
  const isAppointmentInfo = message.text.includes("appointment") && 
    (message.text.includes("scheduled") || message.text.includes("confirm"));
  
  const isResumeData = message.text.includes("resume") && 
    (message.text.includes("created") || message.text.includes("updated"));
  
  const isHousingInfo = message.text.includes("housing") &&
    (message.text.includes("options") || message.text.includes("resources"));
  
  // Format text with paragraph breaks
  const formattedText = message.text.split('\n').map((line, i) => (
    <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
  ));

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      } mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          message.sender === "user"
            ? "bg-navy text-white"
            : isAppointmentInfo
            ? "bg-blue-100 border border-blue-200"
            : isResumeData
            ? "bg-green-100 border border-green-200"
            : isHousingInfo
            ? "bg-amber-100 border border-amber-200"
            : "bg-muted"
        }`}
      >
        {message.sender === "assistant" && message.sentiment && message.sentiment !== "positive" && (
          <div className="flex justify-end mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">This message has been flagged for sentiment review</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        <div className="text-sm">{formattedText}</div>
        
        {message.sender === "assistant" && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {message.suggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className="text-xs py-1 h-auto w-full justify-start hover:bg-muted/60"
              >
                <ArrowRight className="mr-1 h-3 w-3" /> {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        {message.sender === "assistant" && message.sentiment && (
          <div className="flex justify-end mt-1">
            <SentimentIndicator sentiment={message.sentiment} showDetails={true} />
          </div>
        )}
      </div>
    </div>
  );
}
