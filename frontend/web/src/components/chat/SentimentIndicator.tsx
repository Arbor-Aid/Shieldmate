
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

interface SentimentIndicatorProps {
  sentiment: "positive" | "neutral" | "negative";
  score?: number;
  confidence?: number;
  showDetails?: boolean;
}

export default function SentimentIndicator({ sentiment, score, confidence, showDetails = false }: SentimentIndicatorProps) {
  let icon;
  let tooltipText;
  let colorClass;

  switch (sentiment) {
    case "positive":
      icon = <ThumbsUp className="h-3 w-3" />;
      tooltipText = "Positive response";
      colorClass = "text-green-500";
      break;
    case "neutral":
      icon = <AlertTriangle className="h-3 w-3" />;
      tooltipText = "This message may need human review";
      colorClass = "text-yellow-500";
      break;
    case "negative":
      icon = <ThumbsDown className="h-3 w-3" />;
      tooltipText = "This message has been flagged for review";
      colorClass = "text-red-500";
      break;
  }

  // Enhanced tooltip text if score and confidence are available
  if (score !== undefined && confidence !== undefined) {
    tooltipText += ` (Score: ${score.toFixed(2)}, Confidence: ${(confidence * 100).toFixed(0)}%)`;
  }

  if (!showDetails) {
    return <span className={colorClass}>{icon}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={colorClass}>{icon}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
