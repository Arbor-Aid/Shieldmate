
import { QuestionnaireData } from "@/types/questionnaire";
import { User } from "firebase/auth";

export function createInitialQuestionnaireData(currentUser?: User | null): QuestionnaireData {
  // Split displayName into firstName and lastName if possible
  const nameParts = currentUser?.displayName?.trim().split(/\s+/) || [];
  
  return {
    // Basic Info
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(' ') || "",
    fullName: currentUser?.displayName || "",
    dateOfBirth: null,
    phoneNumber: "",
    email: currentUser?.email || "",
    zipCode: "",
    address: "",
    city: "",
    inWashtenawCounty: false,
    
    // Veteran Info
    isVeteran: false,
    serviceBranch: "",
    serviceType: "",
    dischargeStatus: "honorable",
    currentHousing: "stable",
    
    // Household & Income
    householdSize: 1,
    monthlyIncome: 0,
    hasHealthInsurance: false,
    currentChallenges: [],
    
    // Youth/Family
    hasChildren: false,
    childrenAges: "",
    childrenSupportNeeded: [],
    
    // Recovery & Wellness
    wantsRecoveryHelp: false,
    isCurrentlySober: false,
    
    // Preferences
    faithPreference: "no-preference",
    preferredReferralMethod: "in-app",
    
    // Employment
    employmentStatus: "",
    occupation: "",
    employer: "",
    
    // Compatibility fields
    needsAssistance: [],
    immediateHelp: false
  };
}
