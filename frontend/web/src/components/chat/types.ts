
export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  flagged?: boolean;
  sentiment?: "positive" | "neutral" | "negative";
  metadata?: {
    isAppointmentRequest?: boolean;
    isResumeBuilder?: boolean;
    isHousingAssistance?: boolean;
    isReferralReview?: boolean;
  };
}
