
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "firebase/auth";

export type UserRole =
  | "super_admin"
  | "org_admin"
  | "staff"
  | "client"
  // legacy roles
  | "admin"
  | "organization";

export interface UserRoleData {
  uid: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface RoleClaims {
  global?: UserRole[];
  org?: Record<string, UserRole[]>;
}

const ROLE_CLAIMS_KEY = "roles" as const;
const ORG_ROLE_CLAIMS_KEY = "orgRoles" as const;

/**
 * Read custom role claims from the current user token.
 * Format:
 *  roles: string[]            -> global roles (admin/staff/organization/client)
 *  orgRoles: { [orgId]: string[] } -> org-scoped roles
 */
export async function getRoleClaims(user?: User | null): Promise<RoleClaims | null> {
  const current = user ?? auth.currentUser;
  if (!current) return null;
  const token = await current.getIdTokenResult();
  const globalRoles = (token.claims?.[ROLE_CLAIMS_KEY] as string[] | undefined) ?? [];
  const orgRoles = (token.claims?.[ORG_ROLE_CLAIMS_KEY] as Record<string, string[]> | undefined) ?? {};
  return {
    global: globalRoles.filter(Boolean) as UserRole[],
    org: Object.fromEntries(
      Object.entries(orgRoles).map(([orgId, roles]) => [orgId, (roles || []).filter(Boolean) as UserRole[]]),
    ),
  };
}

export function hasRoleClaim(claims: RoleClaims | null, role: UserRole, orgId?: string): boolean {
  if (!claims) return false;
  if (orgId && claims.org?.[orgId]?.includes(role)) return true;
  return claims.global?.includes(role) ?? false;
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

/**
 * Resolve a user's role with claims first, falling back to Firestore.
 */
export async function resolveEffectiveRole(user?: User | null): Promise<UserRole | null> {
  const claims = await getRoleClaims(user);
  if (claims?.global?.length) {
    // prioritize explicit claims; default to first role
    return claims.global[0] as UserRole;
  }

  if (user?.uid) {
    return await getUserRole(user.uid);
  }

  return null;
}
