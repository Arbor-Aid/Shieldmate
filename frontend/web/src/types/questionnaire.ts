
export type ReferralSource = 
  | "VA"
  | "Social Worker"
  | "Friend/Family"
  | "Healthcare Provider"
  | "Other Veterans"
  | "Online Search"
  | "Social Media"
  | "Other";

export interface QuestionnaireData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  address: string;
  city: string;
  zipCode: string;
  isVeteran: boolean;
  serviceType?: string;
  serviceBranch?: string;
  serviceStartDate?: Date | null;
  serviceEndDate?: Date | null;
  dischargeStatus?: string;
  vaStatus?: string;
  currentHousing: string;
  housingSituation?: string;
  householdSize: number;
  monthlyIncome: number;
  hasHealthInsurance: boolean;
  insuranceProvider?: string;
  primaryCare?: string;
  mentalHealthNeeds?: string;
  physicalHealthNeeds?: string;
  disabilities?: string;
  militaryConnected?: boolean;
  hasChildren: boolean;
  childrenAges?: string;
  childrenSupportNeeded?: string[];
  preferredReferralMethod: string;
  immediateHelp: boolean;
  needsAssistance: string[];
  inWashtenawCounty: boolean;
  fullName?: string;
  notes?: string;
  wantsRecoveryHelp: boolean;
  isCurrentlySober: boolean;
  faithPreference: string;
  currentChallenges?: string[];
  branch?: string;
  serviceYears?: string;
  referralSource?: ReferralSource;
  otherReferralDetails?: string;
  
  // Employment-related fields
  employmentStatus?: string;
  occupation?: string;
  employer?: string;
}

export const initialQuestionnaireData: QuestionnaireData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: null,
  address: "",
  city: "",
  zipCode: "",
  isVeteran: true,
  serviceType: "",
  serviceBranch: "army",
  dischargeStatus: "honorable",
  currentHousing: "stable",
  householdSize: 1,
  monthlyIncome: 0,
  hasHealthInsurance: false,
  hasChildren: false,
  preferredReferralMethod: "email",
  immediateHelp: false,
  needsAssistance: [],
  inWashtenawCounty: true,
  wantsRecoveryHelp: false,
  isCurrentlySober: true,
  faithPreference: "no-preference",
  currentChallenges: [],
  childrenSupportNeeded: [],
  
  // Initialize employment fields
  employmentStatus: "",
  occupation: "",
  employer: ""
};
