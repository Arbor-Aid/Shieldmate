
import SentimentIndicator from "./SentimentIndicator";

interface MessageBubbleProps {
  text: string;
  sender: "user" | "assistant";
  sentiment?: "positive" | "neutral" | "negative";
}

const MessageBubble = ({ text, sender, sentiment }: MessageBubbleProps) => {
  return (
    <div
      className={`flex ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          sender === "user"
            ? "bg-blue text-white"
            : "bg-gray text-navy"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {text}
          {sender === "assistant" && sentiment && (
            <SentimentIndicator sentiment={sentiment} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
