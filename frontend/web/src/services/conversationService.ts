
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  setDoc
} from "firebase/firestore";
import { Conversation, ConversationMessage } from "@/types/conversation";
import { trackEvent } from "@/lib/firebase";

// Create a new conversation
export async function createConversation(userId: string, initialSummary: string = "New conversation"): Promise<string> {
  try {
    const conversationData: Omit<Conversation, "id"> = {
      summary: initialSummary,
      lastUpdated: new Date(),
      createdAt: new Date(),
      tags: [],
      messages: [],
      userId
    };
    
    const docRef = await addDoc(collection(db, "users", userId, "chats"), conversationData);
    trackEvent("conversation_created", { userId });
    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

// Get a single conversation by ID
export async function getConversation(userId: string, conversationId: string): Promise<Conversation | null> {
  try {
    const docRef = doc(db, "users", userId, "chats", conversationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Convert Firestore timestamps to JS Dates
      const conversation: Conversation = {
        id: docSnap.id,
        summary: data.summary,
        lastUpdated: data.lastUpdated.toDate(),
        createdAt: data.createdAt.toDate(),
        tags: data.tags || [],
        messages: (data.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        })),
        userId: data.userId
      };
      
      return conversation;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
}

// Get all conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, "users", userId, "chats"),
      orderBy("lastUpdated", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        summary: data.summary,
        lastUpdated: data.lastUpdated.toDate(),
        createdAt: data.createdAt.toDate(),
        tags: data.tags || [],
        messages: (data.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        })),
        userId: data.userId
      });
    });
    
    return conversations;
  } catch (error) {
    console.error("Error getting user conversations:", error);
    throw error;
  }
}

// Update conversation (add new message, update summary, etc.)
export async function updateConversation(
  userId: string,
  conversationId: string,
  updates: Partial<Omit<Conversation, "id" | "userId" | "createdAt">>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "chats", conversationId);
    const updateData = {
      ...updates,
      lastUpdated: new Date()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
}

// Add a message to a conversation
export async function addMessageToConversation(
  userId: string,
  conversationId: string,
  message: Omit<ConversationMessage, "id">
): Promise<string> {
  try {
    const docRef = doc(db, "users", userId, "chats", conversationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Conversation not found");
    }
    
    const data = docSnap.data();
    const messages = data.messages || [];
    
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}`
    };
    
    await updateDoc(docRef, {
      messages: [...messages, newMessage],
      lastUpdated: new Date()
    });
    
    return newMessage.id;
  } catch (error) {
    console.error("Error adding message to conversation:", error);
    throw error;
  }
}

// Update conversation tags
export async function updateConversationTags(
  userId: string,
  conversationId: string,
  tags: string[]
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "chats", conversationId);
    await updateDoc(docRef, { tags });
  } catch (error) {
    console.error("Error updating conversation tags:", error);
    throw error;
  }
}

// Delete a conversation
export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "chats", conversationId);
    await deleteDoc(docRef);
    trackEvent("conversation_deleted", { userId });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}

// Generate a summary of a conversation
export function generateConversationSummary(messages: ConversationMessage[]): string {
  if (messages.length === 0) return "New conversation";
  
  // Get the first few user messages to create a summary
  const userMessages = messages
    .filter(msg => msg.sender === "user")
    .map(msg => msg.text)
    .slice(0, 2);
  
  if (userMessages.length === 0) return "New conversation";
  
  // Use the first message as a summary, truncated if too long
  const firstMessage = userMessages[0];
  const summary = firstMessage.length > 50 
    ? firstMessage.substring(0, 47) + "..."
    : firstMessage;
    
  return summary;
}
