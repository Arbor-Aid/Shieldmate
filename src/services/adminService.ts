
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, updateDoc, getCountFromServer, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminMetrics, AgentReport, FeedbackFlag } from "@/types/admin";
import { Client, Organization } from "@/types/organization";

// Check if user is an admin (with caching in the hook)
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    console.log("Checking admin status for user:", userId);
    const userRef = doc(db, "admin_users", userId);
    const userDoc = await getDoc(userRef);
    const isAdmin = userDoc.exists();
    console.log("Admin status result:", isAdmin);
    return isAdmin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Get admin dashboard metrics more efficiently
export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    // Use countFromServer for more efficient counts
    const clientsQuery = collection(db, "clients");
    const clientsSnapshot = await getCountFromServer(clientsQuery);
    
    const orgsQuery = collection(db, "organizations");
    const orgsSnapshot = await getCountFromServer(orgsQuery);
    
    const activeOrgsQuery = query(collection(db, "organizations"), where("status", "==", "active"));
    const activeOrgsSnapshot = await getCountFromServer(activeOrgsQuery);
    
    const pendingRequestsQuery = query(collection(db, "support_requests"), where("status", "==", "new"));
    const pendingRequestsSnapshot = await getCountFromServer(pendingRequestsQuery);

    return {
      totalClients: clientsSnapshot.data().count,
      totalOrganizations: orgsSnapshot.data().count,
      activeOrganizations: activeOrgsSnapshot.data().count,
      pendingRequests: pendingRequestsSnapshot.data().count
    };
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    return {
      totalClients: 0,
      totalOrganizations: 0,
      activeOrganizations: 0,
      pendingRequests: 0
    };
  }
}

// Real-time metrics listener
export function listenToAdminMetrics(callback: (metrics: AdminMetrics) => void): () => void {
  try {
    // Set up a combined listener for all metrics
    const unsubscribeClients = onSnapshot(collection(db, "clients"), 
      () => getAdminMetrics().then(callback));
    
    const unsubscribeOrgs = onSnapshot(collection(db, "organizations"), 
      () => getAdminMetrics().then(callback));
    
    const unsubscribeRequests = onSnapshot(collection(db, "support_requests"), 
      () => getAdminMetrics().then(callback));
      
    // Return a combined unsubscribe function
    return () => {
      unsubscribeClients();
      unsubscribeOrgs();
      unsubscribeRequests();
    };
  } catch (error) {
    console.error("Error setting up metrics listeners:", error);
    return () => {};
  }
}

// Get all clients with pagination
export async function getAllClients(
  lastDoc: any = null,
  pageSize: number = 20,
  filters: { status?: string; startDate?: Date; endDate?: Date } = {}
): Promise<{ clients: Client[]; lastDoc: any }> {
  try {
    let clientsQuery = query(
      collection(db, "clients"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // Apply filters if provided
    if (filters.status) {
      clientsQuery = query(clientsQuery, where("status", "==", filters.status));
    }

    if (filters.startDate && filters.endDate) {
      clientsQuery = query(
        clientsQuery,
        where("createdAt", ">=", filters.startDate.toISOString()),
        where("createdAt", "<=", filters.endDate.toISOString())
      );
    }

    // Apply pagination if lastDoc is provided
    if (lastDoc) {
      clientsQuery = query(clientsQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(clientsQuery);
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    
    return {
      clients,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], lastDoc: null };
  }
}

// Set up real-time listener for clients
export function listenToAllClients(
  callback: (clients: Client[]) => void,
  pageSize: number = 20
): () => void {
  try {
    console.log("Setting up real-time listener for clients");
    const clientsQuery = query(
      collection(db, "clients"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      callback(clients);
    }, (error) => {
      console.error("Error in clients listener:", error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up clients listener:", error);
    return () => {};
  }
}

// Get all organizations with pagination
export async function getAllOrganizations(
  lastDoc: any = null,
  pageSize: number = 20
): Promise<{ organizations: Organization[]; lastDoc: any }> {
  try {
    let orgsQuery = query(
      collection(db, "organizations"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // Apply pagination if lastDoc is provided
    if (lastDoc) {
      orgsQuery = query(orgsQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(orgsQuery);
    const organizations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
    
    return {
      organizations,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return { organizations: [], lastDoc: null };
  }
}

// Set up real-time listener for organizations
export function listenToAllOrganizations(
  callback: (organizations: Organization[]) => void,
  pageSize: number = 20
): () => void {
  try {
    console.log("Setting up real-time listener for organizations");
    const orgsQuery = query(
      collection(db, "organizations"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const unsubscribe = onSnapshot(orgsQuery, (snapshot) => {
      const organizations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
      callback(organizations);
    }, (error) => {
      console.error("Error in organizations listener:", error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up organizations listener:", error);
    return () => {};
  }
}

// Get AI agent reports
export async function getAgentReports(
  lastDoc: any = null,
  pageSize: number = 20
): Promise<{ reports: AgentReport[]; lastDoc: any }> {
  try {
    let reportsQuery = query(
      collection(db, "ai_reports"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      reportsQuery = query(reportsQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(reportsQuery);
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgentReport));
    
    return {
      reports,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Error fetching AI reports:", error);
    return { reports: [], lastDoc: null };
  }
}

// Get organization feedback and flags
export async function getFeedbackFlags(
  lastDoc: any = null,
  pageSize: number = 20
): Promise<{ flags: FeedbackFlag[]; lastDoc: any }> {
  try {
    let flagsQuery = query(
      collection(db, "feedback_flags"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      flagsQuery = query(flagsQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(flagsQuery);
    const flags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackFlag));
    
    return {
      flags,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Error fetching feedback flags:", error);
    return { flags: [], lastDoc: null };
  }
}

// Update feedback flag status
export async function updateFeedbackFlagStatus(
  flagId: string,
  status: "new" | "in-progress" | "resolved"
): Promise<boolean> {
  try {
    const flagRef = doc(db, "feedback_flags", flagId);
    await updateDoc(flagRef, {
      status
    });
    return true;
  } catch (error) {
    console.error("Error updating feedback flag:", error);
    return false;
  }
}
