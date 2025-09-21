import { collection, doc, getDoc, getDocs, query, where, onSnapshot, updateDoc, arrayUnion, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client, Organization, Referral, ClientNote } from "@/types/organization";

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  try {
    console.log("Getting organization with ID:", organizationId);
    const orgRef = doc(db, "organizations", organizationId);
    const orgDoc = await getDoc(orgRef);
    
    if (orgDoc.exists()) {
      return { id: orgDoc.id, ...orgDoc.data() } as Organization;
    }
    console.log("No organization document found, using mock data");
    return getOrganizationMock();
  } catch (error) {
    console.error("Error fetching organization:", error);
    return getOrganizationMock();
  }
}

export async function getOrganizationByUserId(userId: string): Promise<Organization | null> {
  try {
    console.log("Getting organization for user:", userId);
    const orgQuery = query(
      collection(db, "organizations"),
      where("memberIds", "array-contains", userId)
    );
    
    const snapshot = await getDocs(orgQuery);
    
    if (snapshot.empty) {
      console.log("No organization found for user:", userId);
      return getOrganizationMock();
    }
    
    const orgDoc = snapshot.docs[0];
    return { id: orgDoc.id, ...orgDoc.data() } as Organization;
  } catch (error) {
    console.error("Error fetching organization by user ID:", error);
    return getOrganizationMock();
  }
}

export async function getOrganizationClients(organizationId: string): Promise<Client[]> {
  try {
    console.log("Getting clients for organization:", organizationId);
    const clientsQuery = query(
      collection(db, "clients"),
      where("organizationId", "==", organizationId)
    );
    const snapshot = await getDocs(clientsQuery);
    
    if (snapshot.empty) {
      console.log("No clients found, using mock data");
      return getOrganizationClientsMock();
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  } catch (error) {
    console.error("Error fetching organization clients:", error);
    return getOrganizationClientsMock();
  }
}

export function listenToOrganizationClients(
  organizationId: string, 
  callback: (clients: Client[]) => void
): () => void {
  try {
    console.log("Setting up real-time listener for clients of organization:", organizationId);
    const clientsQuery = query(
      collection(db, "clients"),
      where("organizationId", "==", organizationId)
    );

    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log("No clients found in listener, using mock data");
        callback(getOrganizationClientsMock());
        return;
      }

      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      callback(clients);
    }, (error) => {
      console.error("Error in clients listener:", error);
      callback(getOrganizationClientsMock());
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up clients listener:", error);
    callback(getOrganizationClientsMock());
    return () => {}; // Empty cleanup function
  }
}

export async function getReferrals(organizationId: string): Promise<Referral[]> {
  try {
    console.log("Getting referrals for organization:", organizationId);
    const referralsQuery = query(
      collection(db, "referrals"),
      where("referredToId", "==", organizationId)
    );
    const snapshot = await getDocs(referralsQuery);
    
    if (snapshot.empty) {
      console.log("No referrals found, using mock data");
      return getMockReferrals(organizationId);
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Referral));
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return getMockReferrals(organizationId);
  }
}

export function listenToReferrals(
  organizationId: string, 
  callback: (referrals: Referral[]) => void
): () => void {
  try {
    console.log("Setting up real-time listener for referrals of organization:", organizationId);
    const referralsQuery = query(
      collection(db, "referrals"),
      where("referredToId", "==", organizationId)
    );

    const unsubscribe = onSnapshot(referralsQuery, (snapshot) => {
      if (snapshot.empty) {
        console.log("No referrals found in listener, using mock data");
        callback(getMockReferrals(organizationId));
        return;
      }

      const referrals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Referral));
      callback(referrals);
    }, (error) => {
      console.error("Error in referrals listener:", error);
      callback(getMockReferrals(organizationId));
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up referrals listener:", error);
    callback(getMockReferrals(organizationId));
    return () => {}; // Empty cleanup function
  }
}

export async function getDocumentsCount(organizationId: string): Promise<number> {
  try {
    console.log("Getting document count for organization:", organizationId);
    
    const docsQuery = query(
      collection(db, "documents"),
      where("organizationId", "==", organizationId)
    );
    
    const snapshot = await getDocs(docsQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting documents count:", error);
    return Math.floor(Math.random() * 15) + 5;
  }
}

export async function getSupportCasesCount(organizationId: string): Promise<number> {
  try {
    console.log("Getting support cases count for organization:", organizationId);
    
    const casesQuery = query(
      collection(db, "supportCases"),
      where("organizationId", "==", organizationId),
      where("status", "in", ["open", "pending"])
    );
    
    const snapshot = await getDocs(casesQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting support cases count:", error);
    return Math.floor(Math.random() * 8) + 1;
  }
}

export async function getClientTrends(organizationId: string, timeframe: string = "30days"): Promise<any[]> {
  try {
    console.log(`Getting client trends for organization: ${organizationId}, timeframe: ${timeframe}`);
    
    return getMockTrendData(timeframe);
  } catch (error) {
    console.error("Error getting client trends:", error);
    return getMockTrendData(timeframe);
  }
}

function getMockTrendData(timeframe: string): any[] {
  const data: any[] = [];
  let days = 30;
  
  switch(timeframe) {
    case "7days":
      days = 7;
      break;
    case "30days":
      days = 30;
      break;
    case "90days":
      days = 90;
      break;
    case "year":
      return Array.from({ length: 12 }).map((_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - 11 + i);
        return {
          date: month.toLocaleDateString('en-US', { month: 'short' }),
          newClients: Math.floor(Math.random() * 12) + 1,
          activeClients: Math.floor(Math.random() * 40) + 10,
        };
      });
  }
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1) + i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      newClients: Math.floor(Math.random() * 3),
      activeClients: Math.floor(Math.random() * 10) + 5,
    });
  }
  
  return data;
}

export async function addClientNote(clientId: string, note: ClientNote): Promise<void> {
  try {
    const clientRef = doc(db, "clients", clientId);
    
    await updateDoc(clientRef, {
      notes: arrayUnion(note),
      lastContact: serverTimestamp()
    });
    
    try {
      const clientDoc = await getDoc(clientRef);
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        const organizationId = clientData.organizationId;
        
        if (organizationId) {
          const orgClientRef = doc(db, "organization_clients", `${organizationId}_${clientId}`);
          const orgClientDoc = await getDoc(orgClientRef);
          
          if (orgClientDoc.exists()) {
            await updateDoc(orgClientRef, {
              notes: arrayUnion(note),
              lastContact: serverTimestamp()
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating note in organization_clients:", error);
    }
    
    console.log(`Added note to client ${clientId}`);
  } catch (error) {
    console.error("Error adding note to client:", error);
    throw error;
  }
}

export async function updateClientStatus(clientId: string, newStatus: string): Promise<void> {
  try {
    const clientRef = doc(db, "clients", clientId);
    
    await updateDoc(clientRef, {
      status: newStatus,
      lastContact: serverTimestamp()
    });
    
    try {
      const clientDoc = await getDoc(clientRef);
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        const organizationId = clientData.organizationId;
        
        if (organizationId) {
          const orgClientRef = doc(db, "organization_clients", `${organizationId}_${clientId}`);
          const orgClientDoc = await getDoc(orgClientRef);
          
          if (orgClientDoc.exists()) {
            await updateDoc(orgClientRef, {
              status: newStatus,
              lastContact: serverTimestamp()
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating status in organization_clients:", error);
    }
    
    console.log(`Updated status for client ${clientId} to ${newStatus}`);
  } catch (error) {
    console.error("Error updating client status:", error);
    throw error;
  }
}

function getMockReferrals(organizationId: string): Referral[] {
  return [
    {
      id: "ref1",
      clientName: "James Wilson",
      clientId: "client1",
      referredTo: "Housing First Program",
      referredToId: organizationId,
      status: "Active",
      notes: "Veteran needs immediate housing assistance",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ref2",
      clientName: "Sarah Miller",
      clientId: "client3",
      referredTo: "Employment Services",
      referredToId: organizationId,
      status: "Pending",
      notes: "Looking for job placement assistance",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export function getOrganizationMock(): Organization {
  return {
    id: "org123",
    name: "Veterans Support Alliance",
    email: "contact@vsa.org",
    phone: "555-123-4567",
    status: "active",
    contactPerson: "John Smith",
    createdAt: new Date().toISOString(),
    clientCount: 24,
    type: "Non-profit"
  };
}

export function getOrganizationClientsMock(): Client[] {
  return [
    {
      id: "client1",
      name: "James Wilson",
      email: "james.wilson@example.com",
      phone: "555-111-2222",
      status: "Active",
      serviceType: "Housing Assistance",
      lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: "org123",
      needs: ["Housing", "Employment"],
      background: "Marine veteran seeking housing assistance after discharge",
      notes: [
        {
          id: "note1",
          text: "Initial intake completed. Client is in need of immediate housing assistance.",
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "John Smith"
        },
        {
          id: "note2",
          text: "Referred to local housing program. Followup scheduled for next week.",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "Maria Rodriguez"
        }
      ],
      documents: [
        {
          id: "doc1",
          name: "DD-214.pdf",
          type: "application/pdf",
          url: "https://example.com/files/dd214.pdf",
          uploadedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
          size: 2456789
        }
      ]
    },
    {
      id: "client2",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      status: "Pending",
      serviceType: "Benefits Navigation",
      lastContact: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      organizationId: "org123",
      needs: ["VA Benefits", "Healthcare"],
      notes: [
        {
          id: "note3",
          text: "Client needs assistance with VA benefits application.",
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "John Smith"
        }
      ]
    }
  ];
}
