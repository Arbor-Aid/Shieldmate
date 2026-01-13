
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, addDoc, setDoc } from "firebase/firestore";
import { trackEvent } from "@/lib/firebase";
import { QuestionnaireData } from "@/types/questionnaire";

interface Referral {
  id: string;
  clientId: string;
  clientName: string;
  organizationId: string;
  organizationName: string;
  referralType: string;
  status: "pending" | "accepted" | "scheduled" | "completed" | "declined";
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Get referrals for an organization member
 */
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  try {
    // First, find the organization this user belongs to
    const orgMembersRef = collection(db, "organization_members");
    const orgQuery = query(orgMembersRef, where("userId", "==", userId));
    const orgSnapshot = await getDocs(orgQuery);
    
    if (orgSnapshot.empty) {
      return [];
    }
    
    const organizationId = orgSnapshot.docs[0].data().organizationId;
    
    // Now get referrals for this organization
    const referralsRef = collection(db, "referrals");
    const referralsQuery = query(
      referralsRef, 
      where("organizationId", "==", organizationId),
      where("status", "in", ["pending", "accepted", "scheduled"])
    );
    
    const referralsSnapshot = await getDocs(referralsQuery);
    
    // Track the event
    trackEvent("referrals_viewed", {
      userId,
      organizationId,
      count: referralsSnapshot.size
    });
    
    const referrals: Referral[] = [];
    
    referralsSnapshot.forEach(doc => {
      referrals.push({
        id: doc.id,
        ...doc.data()
      } as Referral);
    });
    
    return referrals;
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return [];
  }
}

/**
 * Update a referral status
 */
export async function updateReferralStatus(
  referralId: string, 
  status: "pending" | "accepted" | "scheduled" | "completed" | "declined",
  notes?: string
): Promise<boolean> {
  try {
    const referralRef = doc(db, "referrals", referralId);
    
    await updateDoc(referralRef, {
      status,
      notes: notes || "",
      updatedAt: serverTimestamp()
    });
    
    trackEvent("referral_status_updated", {
      referralId,
      status
    });
    
    return true;
  } catch (error) {
    console.error("Error updating referral status:", error);
    return false;
  }
}

/**
 * Create a client record for an organization
 */
export async function createClientRecord(
  userId: string,
  organizationId: string | null,
  clientData: QuestionnaireData
): Promise<boolean> {
  try {
    // Create a client record in the clients collection
    await setDoc(doc(db, "clients", userId), {
      userId,
      organizationId,
      fullName: clientData.fullName,
      email: clientData.email,
      phoneNumber: clientData.phoneNumber || "",
      zipCode: clientData.zipCode || "",
      needs: clientData.needsAssistance || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
      notes: ""
    });
    
    // Add an organization_clients relationship if organizationId exists
    if (organizationId) {
      await setDoc(doc(db, "organization_clients", `${organizationId}_${userId}`), {
        organizationId,
        clientId: userId,
        assignedAt: serverTimestamp(),
        status: "active"
      });
    }
    
    // Track the event
    trackEvent("client_record_created", {
      userId,
      organizationId
    });
    
    return true;
  } catch (error) {
    console.error("Error creating client record:", error);
    return false;
  }
}

/**
 * Update a client record
 */
export async function updateClientRecord(
  userId: string,
  clientData: QuestionnaireData
): Promise<boolean> {
  try {
    // Update client record in the user_questionnaires collection
    const userDocRef = doc(db, "user_questionnaires", userId);
    
    await updateDoc(userDocRef, {
      ...clientData,
      updatedAt: serverTimestamp()
    });
    
    // Track the event
    trackEvent("client_record_updated", {
      userId
    });
    
    return true;
  } catch (error) {
    console.error("Error updating client record:", error);
    return false;
  }
}
