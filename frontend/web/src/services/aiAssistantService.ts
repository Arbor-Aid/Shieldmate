
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, addDoc } from "firebase/firestore";
import { UserRole } from "./roleService";
import { checkMessageSentiment } from "./sentimentAnalysisService";

// Types for OpenAI requests
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

// Generate role-specific system prompts
export const getRoleSpecificPrompt = async (role: UserRole, userId: string): Promise<string> => {
  switch (role) {
    case "client":
      return "You are a helpful assistant for veterans seeking support services. Answer questions about housing, employment, benefits, and mental health resources available through 2Marines. Keep responses brief, supportive, and focused on connecting veterans with the right resources. If the user mentions scheduling an appointment or meeting, offer to help them set up a meeting with a case manager by asking about purpose, date, time, and location preferences.";
    
    case "organization": {
      // Fetch organization data for context
      let orgData = "You are assisting an organization partner of 2Marines.";
      try {
        const orgRef = collection(db, "organizations");
        const q = query(orgRef, where("memberIds", "array-contains", userId), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const org = snapshot.docs[0].data();
          orgData = `You are assisting ${org.name}, an organization partner of 2Marines that provides ${org.services?.join(", ") || "support services"}.`;
        }
      } catch (error) {
        console.error("Error fetching organization context:", error);
      }
      
      return `${orgData} Provide guidance on case management, referral processes, and best practices for supporting veterans. Focus on practical advice that helps organizations effectively serve their clients. Remind users about checking appointment requests in the Appointments tab when appropriate.`;
    }
    
    case "admin":
      return "You are assisting a 2Marines administrator. Help with generating reports, analyzing data trends, and providing insights about organization performance and client needs. Focus on actionable information that helps improve service delivery and organization management. Provide information about all system functions including appointment scheduling.";
    
    default:
      return "You are a helpful assistant for the 2Marines Autonomous Support Platform. Answer questions clearly and concisely.";
  }
};

// Get recent context data from Firestore based on user role
export const getContextData = async (role: UserRole, userId: string): Promise<string> => {
  let contextData = "";
  
  try {
    if (role === "client") {
      // Get client's active referrals and services
      const referralsRef = collection(db, "referrals");
      const q = query(referralsRef, where("clientId", "==", userId), limit(5));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        contextData += "Your current referrals: ";
        snapshot.docs.forEach(doc => {
          const referral = doc.data();
          contextData += `${referral.referredTo} (${referral.status}), `;
        });
      }
      
      // Get client's appointment requests
      const appointmentsRef = collection(db, "appointment_requests");
      const appQuery = query(appointmentsRef, where("userId", "==", userId), limit(3));
      const appSnapshot = await getDocs(appQuery);
      
      if (!appSnapshot.empty) {
        contextData += "\nYour recent appointment requests: ";
        appSnapshot.docs.forEach(doc => {
          const appointment = doc.data();
          contextData += `${appointment.purpose} (${appointment.status}), `;
        });
      }
    } 
    else if (role === "organization") {
      // Get organization's recent clients
      const clientsRef = collection(db, "clients");
      const orgRef = collection(db, "organizations");
      const orgQuery = query(orgRef, where("memberIds", "array-contains", userId), limit(1));
      const orgSnapshot = await getDocs(orgQuery);
      
      if (!orgSnapshot.empty) {
        const orgId = orgSnapshot.docs[0].id;
        const q = query(clientsRef, where("organizationId", "==", orgId), limit(5));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          contextData += "Your recent clients: ";
          snapshot.docs.forEach(doc => {
            const client = doc.data();
            contextData += `${client.name} (${client.status}), `;
          });
        }
        
        // Get organization's appointment requests
        const appointmentsRef = collection(db, "appointment_requests");
        const appQuery = query(appointmentsRef, where("organizationId", "==", orgId), limit(3));
        const appSnapshot = await getDocs(appQuery);
        
        if (!appSnapshot.empty) {
          contextData += "\nRecent appointment requests: ";
          appSnapshot.docs.forEach(doc => {
            const appointment = doc.data();
            contextData += `${appointment.userName}: ${appointment.purpose} (${appointment.status}), `;
          });
        }
      }
    }
    else if (role === "admin") {
      // Get some high-level stats
      const orgsRef = collection(db, "organizations");
      const orgsSnapshot = await getDocs(orgsRef);
      const clientsRef = collection(db, "clients");
      const clientsSnapshot = await getDocs(clientsRef);
      
      contextData += `Current system has ${orgsSnapshot.size} organizations and ${clientsSnapshot.size} clients. `;
      
      // Get appointment stats
      const appointmentsRef = collection(db, "appointment_requests");
      const appointmentsSnapshot = await getDocs(appointmentsRef);
      
      if (appointmentsSnapshot.size > 0) {
        const pendingCount = appointmentsSnapshot.docs.filter(doc => 
          doc.data().status === 'pending'
        ).length;
        
        contextData += `There are currently ${appointmentsSnapshot.size} appointment requests, with ${pendingCount} pending. `;
      }
    }
  } catch (error) {
    console.error("Error fetching context data:", error);
  }
  
  return contextData;
};

// Function to send request to OpenAI API
export const queryOpenAI = async (
  messages: OpenAIMessage[],
  model: string = "gpt-4o-mini",
  userId?: string,
  assistantType: string = "general"
): Promise<string> => {
  try {
    // In a real implementation, you would need to securely access your OpenAI API key
    // This is a placeholder - the API key should be stored securely in environment variables
    const apiKey = process.env.OPENAI_API_KEY || "";
    
    // If no API key is available, return a fallback message
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return "I'm unable to process your request at this time. Please contact support for assistance.";
    }
    
    const request: OpenAIRequest = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500
    };
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as OpenAIResponse;
    const aiResponse = data.choices[0].message.content;
    
    // Apply sentiment analysis middleware before returning the response
    const sentimentCheckedResponse = await checkMessageSentiment(
      aiResponse,
      assistantType,
      userId
    );
    
    // If the message was flagged, log it to Firestore for admin review
    if (sentimentCheckedResponse.flagged) {
      try {
        await addDoc(collection(db, "flaggedMessages"), {
          message: aiResponse,
          userId,
          assistantType,
          timestamp: new Date(),
          reason: "Sentiment analysis flagged message as potentially negative or neutral",
          reviewed: false
        });
      } catch (error) {
        console.error("Error logging flagged message:", error);
      }
    }
    
    // Return the potentially modified response
    return sentimentCheckedResponse.text;
  } catch (error) {
    console.error("Error querying OpenAI:", error);
    return "I encountered an error processing your request. Please try again later.";
  }
};
