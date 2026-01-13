
import { doc, collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "./notificationService";
import { Organization } from "@/types/organization";
import { QuestionnaireData } from "@/types/questionnaire";
import { getFunctions, httpsCallable } from "firebase/functions";

type OrganizationMatch = {
  id: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  matchReason: string[];
  createdAt: any;
  status: "pending" | "contacted" | "accepted" | "declined";
  notifiedAt?: any;
  contactedAt?: any;
}

// Initialize Firebase Functions
const functions = getFunctions();

/**
 * Find organizations that match the user's needs based on questionnaire data
 */
export const findMatchingOrganizations = async (
  userData: QuestionnaireData, 
  userId: string
): Promise<Organization[]> => {
  try {
    // Build query based on user's needs
    const orgsQuery = query(
      collection(db, "organizations"),
      where("status", "==", "active")
    );
    
    const querySnapshot = await getDocs(orgsQuery);
    const matchingOrganizations: Organization[] = [];
    
    querySnapshot.forEach((doc) => {
      const org = { id: doc.id, ...doc.data() } as Organization;
      
      // Check if organization serves user's location
      if (userData.inWashtenawCounty && !org.servesWashtenaw) {
        return;
      }
      
      // Check if organization matches faith preference
      if (userData.faithPreference === "faith-based" && org.faithBased === false) {
        return;
      }
      
      if (userData.faithPreference === "secular" && org.faithBased === true) {
        return;
      }
      
      // Check if organization provides services matching user's needs
      if (org.services && userData.needsAssistance) {
        const hasMatchingService = userData.needsAssistance.some(need => 
          org.services?.includes(need)
        );
        
        if (hasMatchingService) {
          matchingOrganizations.push(org);
        }
      }
      
      // Check if organization handles user's challenges
      if (org.services && userData.currentChallenges) {
        const hasMatchingChallenges = userData.currentChallenges.some(challenge => 
          org.services?.includes(challenge)
        );
        
        if (hasMatchingChallenges) {
          matchingOrganizations.push(org);
        }
      }
    });
    
    // Remove duplicates (in case an org matched on multiple criteria)
    return Array.from(new Set(matchingOrganizations.map(org => org.id)))
      .map(id => matchingOrganizations.find(org => org.id === id)!);
    
  } catch (error) {
    console.error("Error finding matching organizations:", error);
    return [];
  }
};

/**
 * Create organization match records and send notifications
 */
export const createOrganizationMatches = async (
  userId: string, 
  userName: string, 
  userEmail: string,
  matchingOrganizations: Organization[],
  userData: QuestionnaireData
): Promise<boolean> => {
  try {
    const batch = [];
    
    for (const org of matchingOrganizations) {
      // Determine match reasons
      const matchReasons: string[] = [];
      
      if (userData.needsAssistance) {
        userData.needsAssistance.forEach(need => {
          if (org.services?.includes(need)) {
            matchReasons.push(need);
          }
        });
      }
      
      if (userData.currentChallenges) {
        userData.currentChallenges.forEach(challenge => {
          if (org.services?.includes(challenge)) {
            matchReasons.push(challenge);
          }
        });
      }
      
      // Create match record
      const matchData: Omit<OrganizationMatch, 'id'> = {
        organizationId: org.id,
        organizationName: org.name,
        userId,
        userName,
        userEmail,
        matchReason: matchReasons,
        createdAt: serverTimestamp(),
        status: "pending",
      };
      
      const docRef = await addDoc(collection(db, "organization_matches"), matchData);
      
      // Create in-app notification for the organization
      await notifyOrganizationOfMatch(org, userName, matchReasons, docRef.id);
      
      // Call the Cloud Function to send email notification
      try {
        const sendEmailNotification = httpsCallable(functions, 'sendMatchNotificationEmail');
        await sendEmailNotification({
          organizationId: org.id,
          organizationName: org.name,
          organizationEmail: org.email,
          userName,
          userNeeds: matchReasons,
          matchId: docRef.id
        });
      } catch (error) {
        console.error("Error sending email notification:", error);
      }
      
      batch.push(docRef.id);
    }
    
    return batch.length > 0;
  } catch (error) {
    console.error("Error creating organization matches:", error);
    return false;
  }
};

/**
 * Create an in-app notification for the organization
 */
const notifyOrganizationOfMatch = async (
  organization: Organization,
  userName: string,
  matchReasons: string[],
  matchId: string
): Promise<void> => {
  // Create notifications for each organization member
  if (organization.memberIds && organization.memberIds.length > 0) {
    for (const memberId of organization.memberIds) {
      await createNotification({
        userId: memberId,
        type: "new_match",
        title: "New Client Match",
        message: `${userName} needs assistance with: ${matchReasons.join(", ")}`,
        link: `/organization?tab=matches&matchId=${matchId}`,
        entityId: matchId
      });
    }
  }
};

/**
 * Mark an organization match as contacted
 */
export const markMatchAsContacted = async (matchId: string): Promise<boolean> => {
  try {
    const matchRef = doc(db, "organization_matches", matchId);
    await updateDoc(matchRef, {
      status: "contacted",
      contactedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error marking match as contacted:", error);
    return false;
  }
};

/**
 * Get pending matches for an organization
 */
export const getOrganizationPendingMatches = async (organizationId: string): Promise<OrganizationMatch[]> => {
  try {
    const matchesQuery = query(
      collection(db, "organization_matches"),
      where("organizationId", "==", organizationId),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(matchesQuery);
    const matches: OrganizationMatch[] = [];
    
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() } as OrganizationMatch);
    });
    
    return matches;
  } catch (error) {
    console.error("Error getting organization pending matches:", error);
    return [];
  }
};

/**
 * Export the OrganizationMatch type
 */
export type { OrganizationMatch };
