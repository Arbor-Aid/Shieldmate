
import { addDoc, collection, getDocs, query, where, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AppointmentRequest {
  id?: string;
  userId: string;
  userName: string;
  purpose: string;
  preferredDate: Timestamp | Date;
  preferredTime: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  organizationId?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export async function createAppointmentRequest(appointmentData: Omit<AppointmentRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const appointmentWithMetadata = {
      ...appointmentData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "appointment_requests"), appointmentWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error("Error creating appointment request:", error);
    throw error;
  }
}

export async function getAppointmentsByUserId(userId: string): Promise<AppointmentRequest[]> {
  try {
    const appointmentsRef = collection(db, "appointment_requests");
    const q = query(appointmentsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AppointmentRequest));
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    return [];
  }
}

export async function getAppointmentsByOrganizationId(organizationId: string): Promise<AppointmentRequest[]> {
  try {
    const appointmentsRef = collection(db, "appointment_requests");
    const q = query(appointmentsRef, where("organizationId", "==", organizationId));
    const querySnapshot = await getDocs(q);
    
    // Also get unassigned appointments that organizations can claim
    const unassignedQuery = query(appointmentsRef, where("organizationId", "==", null));
    const unassignedSnapshot = await getDocs(unassignedQuery);
    
    // Combine assigned and unassigned appointments
    const appointments = [
      ...querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppointmentRequest)),
      ...unassignedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppointmentRequest))
    ];
    
    return appointments;
  } catch (error) {
    console.error("Error fetching organization appointments:", error);
    return [];
  }
}

export async function updateAppointmentStatus(
  appointmentId: string, 
  status: 'confirmed' | 'cancelled',
  organizationId?: string
): Promise<boolean> {
  try {
    const appointmentRef = doc(db, "appointment_requests", appointmentId);
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: Timestamp.now()
    };
    
    // If organization is claiming this appointment
    if (organizationId) {
      updateData.organizationId = organizationId;
    }
    
    await updateDoc(appointmentRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return false;
  }
}
