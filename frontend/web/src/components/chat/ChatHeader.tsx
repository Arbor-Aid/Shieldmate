
import { Bot, MinimizeIcon, MaximizeIcon } from "lucide-react";
import { CardHeader } from "../ui/card";

interface ChatHeaderProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const ChatHeader = ({ isMinimized, onToggleMinimize }: ChatHeaderProps) => {
  return (
    <CardHeader 
      className="bg-navy text-white py-3 px-4 rounded-t-lg cursor-pointer"
      onClick={onToggleMinimize}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        {isMinimized ? (
          <MaximizeIcon className="h-4 w-4" />
        ) : (
          <MinimizeIcon className="h-4 w-4" />
        )}
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
