
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export default function SuggestionChips({ suggestions, onSelect, disabled = false }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="max-w-full">
      <div className="flex space-x-2 pb-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-nowrap text-xs py-1 px-3 h-auto"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
