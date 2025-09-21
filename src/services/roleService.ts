
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserRole = "admin" | "organization" | "client";

export interface UserRoleData {
  uid: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Fetch user role from Firestore
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data()?.role) {
      return userDoc.data().role as UserRole;
    }
    
    // Default to client if no role is set
    return "client";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Set or update a user's role
 */
export async function setUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { 
        role,
        updatedAt: new Date()
      });
    } else {
      await setDoc(userDocRef, {
        uid: userId,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    return false;
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === role;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return await hasRole(userId, "admin");
}

/**
 * Check if user has organization role
 */
export async function isOrganization(userId: string): Promise<boolean> {
  return await hasRole(userId, "organization");
}
