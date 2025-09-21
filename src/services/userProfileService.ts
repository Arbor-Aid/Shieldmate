
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QuestionnaireData, ReferralSource } from "@/types/questionnaire";

export interface UserProfile extends Partial<QuestionnaireData> {
  email?: string;
  displayName?: string;
  photoURL?: string;
  uid: string;
  firstName?: string;
  lastName?: string;
  branch?: string;
  serviceYears?: string;
  referralSource?: ReferralSource;
  needsAssistance?: string[];
  immediateHelp?: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "user_questionnaires", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { uid: userId, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
  try {
    const userDocRef = doc(db, "user_questionnaires", userId);
    await updateDoc(userDocRef, profileData);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}
