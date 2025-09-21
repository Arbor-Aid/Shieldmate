
import { UserProfile } from "@/services/userProfileService";
import { UserRole } from "@/services/roleService";

// Define types for prompt suggestions
export type MessageContext = {
  text: string;
  sender: "user" | "assistant";
};

/**
 * Get initial guidance prompts based on user role
 */
export const getGuidancePrompts = (role: UserRole | null): string[] => {
  const commonPrompts = [
    "I need help finding housing resources",
    "How do I create a resume?",
    "Can you help me schedule an appointment?",
    "What benefits am I eligible for?",
    "I need mental health support"
  ];

  switch (role) {
    case "client":
      return [
        ...commonPrompts,
        "How can I find employment opportunities?",
        "What documents do I need for VA benefits?",
        "Are there any emergency housing options?"
      ];
    case "organization":
      return [
        "How do I process a new referral?",
        "Can you help me with client documentation?",
        "What resources are available for my clients?",
        "How do I track client progress?",
        "Generate a summary of recent activity"
      ];
    case "admin":
      return [
        "Show me system statistics",
        "How many new users registered this week?",
        "Generate a report on resource utilization",
        "Show flagged conversations requiring attention",
        "How many appointments were scheduled today?"
      ];
    default:
      return commonPrompts;
  }
};

/**
 * Generate contextual suggestions based on conversation history
 */
export const getContextualSuggestions = (
  messages: MessageContext[],
  userRole: UserRole | null = null
): string[] => {
  if (!messages || messages.length === 0) {
    return getGuidancePrompts(userRole);
  }

  // Get the last few messages for context
  const recentMessages = messages.slice(-3);
  const lastUserMessage = recentMessages.find(msg => msg.sender === "user")?.text.toLowerCase() || "";
  const lastAssistantMessage = recentMessages.find(msg => msg.sender === "assistant")?.text.toLowerCase() || "";

  // Generate contextual suggestions
  if (lastUserMessage.includes("resume") || lastAssistantMessage.includes("resume")) {
    return [
      "Help me list my military skills on my resume",
      "What civilian jobs match my military experience?",
      "How do I highlight my service in my resume?",
      "Can you help me write a cover letter?",
      "What certifications should I include?"
    ];
  } else if (lastUserMessage.includes("housing") || lastAssistantMessage.includes("housing")) {
    return [
      "What housing assistance programs are available for veterans?",
      "How do I apply for VA home loans?",
      "Are there any emergency housing options near me?",
      "What documentation do I need for housing assistance?",
      "Connect me with a housing specialist"
    ];
  } else if (lastUserMessage.includes("appointment") || lastAssistantMessage.includes("appointment") || 
             lastUserMessage.includes("schedule") || lastAssistantMessage.includes("schedule")) {
    return [
      "I'd like to schedule an appointment for next week",
      "What information do I need to provide for an appointment?",
      "Can I reschedule my existing appointment?",
      "Who will I be meeting with?",
      "What should I bring to my appointment?"
    ];
  } else if (lastUserMessage.includes("benefit") || lastAssistantMessage.includes("benefit") ||
             lastUserMessage.includes("va") || lastAssistantMessage.includes("va")) {
    return [
      "What VA benefits am I eligible for?",
      "How do I apply for disability benefits?",
      "What documents do I need for my benefits application?",
      "How long does the benefits application process take?",
      "Can you help me check my benefits status?"
    ];
  } else if (lastUserMessage.includes("job") || lastAssistantMessage.includes("job") ||
             lastUserMessage.includes("employment") || lastAssistantMessage.includes("employment") ||
             lastUserMessage.includes("work") || lastAssistantMessage.includes("work")) {
    return [
      "What job opportunities are available for veterans?",
      "How do I translate my military skills to civilian jobs?",
      "Are there any job fairs for veterans coming up?",
      "What companies prioritize hiring veterans?",
      "Can you help me prepare for a job interview?"
    ];
  } else if (userRole === "organization") {
    return [
      "How do I manage client referrals?",
      "What resources should I recommend for a homeless veteran?",
      "How can I track client progress?",
      "Generate a summary report for my clients",
      "What documentation is needed for housing assistance?"
    ];
  }

  // Default suggestions if no specific context is detected
  return getGuidancePrompts(userRole);
};

/**
 * Get fallback suggestions based on user profile data
 */
export const getFallbackSuggestions = (profile: UserProfile | null, userRole: UserRole | null): string[] => {
  if (userRole === "organization") {
    return [
      "How do I process new referrals?",
      "What housing resources are available?",
      "How do I update client information?",
      "Generate a report of my current clients",
      "How do I schedule an appointment for a client?"
    ];
  }
  
  if (userRole === "admin") {
    return [
      "Show system statistics",
      "Generate a report of active users",
      "How many appointments were scheduled today?",
      "Show resources with highest utilization",
      "List flagged conversations needing attention"
    ];
  }

  if (!profile) {
    return [
      "How do I get started with 2Marines?",
      "What services do you offer?",
      "How can I find housing assistance?",
      "I need help with my VA benefits",
      "How do I create a resume?"
    ];
  }

  const suggestions: string[] = [];

  // Add personalized suggestions based on profile data
  if (profile.needsAssistance?.includes("housing")) {
    suggestions.push("I need help finding housing");
    suggestions.push("What housing assistance is available for veterans?");
  }

  if (profile.needsAssistance?.includes("employment")) {
    suggestions.push("Help me find job opportunities");
    suggestions.push("I need help creating a resume");
  }

  if (profile.needsAssistance?.includes("benefits")) {
    suggestions.push("What benefits am I eligible for?");
    suggestions.push("How do I apply for VA benefits?");
  }

  if (profile.needsAssistance?.includes("health")) {
    suggestions.push("I need mental health resources");
    suggestions.push("How do I access VA healthcare?");
  }

  // Ensure we have at least 5 suggestions
  const defaultSuggestions = [
    "How do I schedule an appointment?",
    "What services does 2Marines offer?",
    "Connect me with a case manager",
    "How can I update my information?",
    "What documents do I need to provide?"
  ];

  // Fill with defaults if needed
  while (suggestions.length < 5) {
    const nextDefault = defaultSuggestions[suggestions.length];
    if (nextDefault) {
      suggestions.push(nextDefault);
    } else {
      break;
    }
  }

  return suggestions;
};

/**
 * Detect if a conversation needs human escalation
 * This function analyzes the conversation and determines if it should be escalated to a human
 */
export const needsHumanEscalation = (messages: MessageContext[]): {
  needsEscalation: boolean;
  reason?: string;
} => {
  if (!messages || messages.length === 0) {
    return { needsEscalation: false };
  }

  const lastUserMessages = messages
    .filter(msg => msg.sender === "user")
    .slice(-3)
    .map(msg => msg.text.toLowerCase());

  // Check for emergency keywords
  const emergencyKeywords = [
    "suicide", "kill myself", "end my life", "don't want to live",
    "emergency", "crisis", "urgent help", "immediate danger",
    "violent", "abuse", "assault", "hurt myself", "hurt someone"
  ];

  for (const message of lastUserMessages) {
    for (const keyword of emergencyKeywords) {
      if (message.includes(keyword)) {
        return { 
          needsEscalation: true, 
          reason: "Emergency situation detected" 
        };
      }
    }
  }

  // Check for repeated frustration
  const frustrationKeywords = [
    "not helping", "useless", "waste of time", "don't understand",
    "frustrated", "angry", "upset", "not what I asked for", "stupid"
  ];

  let frustrationCount = 0;
  for (const message of lastUserMessages) {
    for (const keyword of frustrationKeywords) {
      if (message.includes(keyword)) {
        frustrationCount++;
        break;
      }
    }
  }

  if (frustrationCount >= 2) {
    return { 
      needsEscalation: true, 
      reason: "User showing repeated frustration" 
    };
  }

  // Check for complex requests that AI might struggle with
  const complexRequestKeywords = [
    "specific legal", "lawsuit", "complex medical", "diagnosed with",
    "specific financial", "tax implications", "investment strategy"
  ];

  for (const message of lastUserMessages) {
    for (const keyword of complexRequestKeywords) {
      if (message.includes(keyword)) {
        return { 
          needsEscalation: true, 
          reason: "Complex request that may require expert assistance" 
        };
      }
    }
  }

  return { needsEscalation: false };
};
