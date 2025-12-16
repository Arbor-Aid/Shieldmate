import { collection, collectionGroup, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Organization, OrganizationMembership, OrgRole } from "@/types/organization";

const ORG_COLLECTION = "organizations";
const ORG_MEMBERS_COLLECTION = "members";

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const ref = doc(db, ORG_COLLECTION, orgId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Organization) };
}

export async function getUserOrganizations(userId: string): Promise<OrganizationMembership[]> {
  const q = query(collectionGroup(db, ORG_MEMBERS_COLLECTION), where("uid", "==", userId));
  const results = await getDocs(q);
  return results.docs.map((docSnap) => docSnap.data() as OrganizationMembership);
}

export async function getOrgRolesForUser(orgId: string, userId: string): Promise<OrgRole[]> {
  const ref = doc(db, ORG_COLLECTION, orgId, ORG_MEMBERS_COLLECTION, userId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return [];
  return (snapshot.data()?.roles as OrgRole[] | undefined) ?? [];
}

export async function listOrgMembers(orgId: string): Promise<OrganizationMembership[]> {
  const q = query(collection(db, ORG_COLLECTION, orgId, ORG_MEMBERS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ uid: docSnap.id, orgId, ...(docSnap.data() as OrganizationMembership) }));
}

export async function addOrgMember(orgId: string, member: OrganizationMembership) {
  const ref = doc(db, ORG_COLLECTION, orgId, ORG_MEMBERS_COLLECTION, member.uid);
  await setDoc(ref, {
    ...member,
    orgId,
    roles: member.roles,
    status: member.status ?? "active",
    updatedAt: new Date().toISOString(),
    createdAt: member.createdAt ?? new Date().toISOString(),
  });
}
