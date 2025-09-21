
import { useState, useEffect } from "react";
import { getContextualSuggestions } from "@/services/aiGuidanceService";
import { Button } from "@/components/ui/button";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { Lightbulb } from "lucide-react";

interface PromptSuggestionProps {
  onSelect: (prompt: string) => void;
  maxSuggestions?: number;
}

export function PromptSuggestion({ onSelect, maxSuggestions = 3 }: PromptSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { userRole } = useRoleAuth();
  
  useEffect(() => {
    // Get initial suggestions
    const initialSuggestions = getContextualSuggestions([], userRole);
    setSuggestions(initialSuggestions.slice(0, maxSuggestions));
  }, [maxSuggestions, userRole]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <Lightbulb className="h-3 w-3" />
        <span>Try asking about:</span>
      </div>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs h-auto py-2 px-3 hover:bg-muted/50"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
