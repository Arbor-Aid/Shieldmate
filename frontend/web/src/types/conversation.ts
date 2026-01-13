
export interface ConversationMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface Conversation {
  id: string;
  summary: string;
  lastUpdated: Date;
  createdAt: Date;
  tags: string[];
  messages: ConversationMessage[];
  userId: string;
}
