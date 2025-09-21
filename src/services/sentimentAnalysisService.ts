
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";

// Types for sentiment analysis
export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
}

interface MessageAnalysisResult {
  text: string;
  flagged: boolean;
}

// In-memory log for flagged content (used in admin dashboard)
const flaggedSentimentLog: {
  message: string;
  result: SentimentResult;
  timestamp: Date;
  userId?: string;
  assistantType: string;
}[] = [];

// Get the in-memory log of flagged messages (for admin dashboard)
export const getFlaggedSentimentLog = () => {
  return [...flaggedSentimentLog];
};

// Enhanced sentiment analysis that includes more veteran-specific terms and emotional cues
export const analyzeSentiment = (text: string): SentimentResult => {
  // List of negative words/phrases that might indicate problematic content
  const negativePatterns = [
    /cannot|can't|won't|refuse|sorry|unfortunately|not possible|terrible|awful|bad|negative|hate|stupid|incompetent|useless|wrong|fail|failed|horrible/gi,
    /inappropriate|offensive|unethical|illegal|against|policy|violation|error|angry|frustrated|upset|annoyed/gi,
    /struggle|struggling|hard time|difficult|challenging|overwhelmed|anxiety|anxious|depressed|depression|lonely|isolated/gi,
    /confused|lost|worried|fearful|scared|terrified|hopeless|helpless|stuck|trapped|tired|exhausted/gi
  ];
  
  // List of positive words/phrases
  const positivePatterns = [
    /great|excellent|good|wonderful|helpful|perfect|thank|thanks|appreciate|happy|glad|pleasure|success|successful|solved|resolved/gi,
    /certainly|definitely|absolutely|can help|will help|happy to|pleased to|excited|support|assist|assistance|solution|recommend/gi,
    /hope|hopeful|encouraging|opportunity|progress|achievement|accomplish|achieve|improve|better|positive|strength|resilient/gi,
    /capable|qualified|skilled|experienced|impressive|proud|honor|service|dedication|committed|passionate|determined/gi
  ];
  
  // List of veteran-specific positive support phrases
  const veteranSupportPatterns = [
    /eligible|qualify|benefits|assistance|resources|support|services|program|opportunity|connect|referral/gi,
    /housing assistance|employment support|job placement|training program|skill development|education benefits/gi,
    /va benefits|gi bill|disability claim|healthcare access|mental health support|counseling services/gi,
    /local resources|community support|peer support|veteran community|fellow veterans|support network/gi
  ];
  
  // Count matches
  let negativeCount = 0;
  let positiveCount = 0;
  let supportCount = 0;
  
  negativePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) negativeCount += matches.length;
  });
  
  positivePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) positiveCount += matches.length;
  });
  
  veteranSupportPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) supportCount += matches.length * 1.5; // Weight support terms higher
  });
  
  // Calculate sentiment score from -1 to 1
  const totalMatches = positiveCount + supportCount + negativeCount;
  let score = 0;
  let confidence = 0.5; // Default medium confidence
  
  if (totalMatches > 0) {
    score = ((positiveCount + supportCount) - negativeCount) / totalMatches;
    confidence = Math.min(0.5 + totalMatches / 20, 0.95); // Increase confidence with more matches, max 0.95
  }
  
  // Determine sentiment category
  let sentiment: 'positive' | 'neutral' | 'negative';
  if (score > 0.2) {
    sentiment = 'positive';
  } else if (score < -0.1) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return { sentiment, score, confidence };
};

// Check for crisis keywords that require immediate escalation
export const checkForCrisisKeywords = (text: string): boolean => {
  const crisisKeywords = [
    /suicide|suicidal|kill myself|end my life|don't want to live|take my life/gi,
    /hurt myself|hurt others|harm myself|harm others|violence|violent thoughts/gi,
    /emergency|crisis|urgent help|immediate danger|life threatening|critical situation/gi,
    /abuse|assault|trauma|attacked|threatened|danger|unsafe|scared for my life/gi
  ];
  
  for (const pattern of crisisKeywords) {
    if (pattern.test(text)) {
      return true;
    }
  }
  
  return false;
};

// Enhanced middleware to check message sentiment before sending to user
export const checkMessageSentiment = async (
  message: string,
  assistantType: string = 'general_assistant',
  userId?: string
): Promise<MessageAnalysisResult> => {
  // Analyze sentiment
  const result = analyzeSentiment(message);
  
  // Check for crisis keywords
  const isCrisis = checkForCrisisKeywords(message);
  
  // If crisis is detected, we should return a specialized response and flag it
  if (isCrisis) {
    try {
      // Log the crisis message to Firestore
      await addDoc(collection(db, "crisisAlerts"), {
        message,
        userId,
        timestamp: new Date(),
        resolved: false,
        assistantType
      });
      
      // If there's a user profile, update it to mark the crisis flag
      if (userId) {
        const userProfileRef = doc(db, "user_questionnaires", userId);
        const profileSnap = await getDoc(userProfileRef);
        
        if (profileSnap.exists()) {
          await updateDoc(userProfileRef, {
            needsUrgentOutreach: true,
            lastCrisisAlert: new Date()
          });
        }
      }
      
      // Return a crisis response
      return {
        text: "I notice you might be going through a difficult time. Your well-being is important. " +
              "If you're in immediate danger, please call 911 or the Veterans Crisis Line at 1-800-273-8255 and press 1. " +
              "A 2Marines team member will also reach out to you soon. Would you like me to connect you directly with a support specialist?",
        flagged: true
      };
    } catch (error) {
      console.error("Error handling crisis message:", error);
    }
  }
  
  // If sentiment is negative or neutral, flag the message
  const isFlagged = result.sentiment !== 'positive';
  
  if (isFlagged) {
    // Log to in-memory storage for admin dashboard
    flaggedSentimentLog.push({
      message,
      result,
      timestamp: new Date(),
      userId,
      assistantType
    });
    
    // In a production app, we would store this in Firestore too
    try {
      await addDoc(collection(db, "flaggedMessages"), {
        message,
        sentiment: result.sentiment,
        score: result.score,
        confidence: result.confidence,
        timestamp: new Date(),
        userId,
        assistantType,
        reviewed: false
      });
    } catch (error) {
      console.error("Error logging flagged message to Firestore:", error);
    }
    
    // For negative sentiment with high confidence, we could replace the message
    if (result.sentiment === 'negative' && result.confidence > 0.8) {
      // Return a more empathetic and supportive message
      return {
        text: "I understand this can be challenging. I want to make sure I'm providing the most supportive assistance possible. " +
              "Please tell me more about your situation so I can connect you with the right resources and support.",
        flagged: true
      };
    }
  }
  
  // For neutral or mildly negative content, we still return the original
  // but mark it as flagged for review
  return { text: message, flagged: isFlagged };
};

