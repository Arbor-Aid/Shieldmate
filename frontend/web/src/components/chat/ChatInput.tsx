
import { Button } from "../ui/button";
import { SendHorizontal, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { CardFooter } from "../ui/card";

interface ChatInputProps {
  newMessage: string;
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onToggleListening: () => void;
  onToggleSpeaking: () => void;
}

const ChatInput = ({
  newMessage,
  isListening,
  isSpeaking,
  isLoading,
  onMessageChange,
  onSendMessage,
  onToggleListening,
  onToggleSpeaking,
}: ChatInputProps) => {
  return (
    <CardFooter className="p-4 border-t">
      <div className="flex flex-col w-full space-y-2">
        <div className="flex justify-between px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleListening}
            className={`${isListening ? 'text-red-500' : 'text-gray-500'}`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSpeaking}
            className={`${isSpeaking ? 'text-blue' : 'text-gray-500'}`}
          >
            {isSpeaking ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex w-full space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
          />
          <Button
            onClick={onSendMessage}
            className="btn-primary"
            disabled={!newMessage.trim() || isLoading}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </CardFooter>
  );
};

export default ChatInput;
