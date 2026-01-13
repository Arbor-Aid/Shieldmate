import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { recordAudit } from "@/lib/audit";

const INVITES_COLLECTION = "invites";

export type InviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface OrgInvite {
  id?: string;
  orgId: string;
  invitedEmail?: string;
  invitedUid?: string;
  roles: string[];
  token: string;
  status: InviteStatus;
  expiresAt: string;
  createdBy: string;
}

const nowIso = () => new Date().toISOString();

export async function createInvite(params: {
  orgId: string;
  invitedEmail?: string;
  invitedUid?: string;
  roles: string[];
  expiresAt: string;
  createdBy: string;
}) {
  const token = crypto.randomUUID();
  const invite: OrgInvite = {
    ...params,
    token,
    status: "pending",
  };
  const ref = await addDoc(collection(db, INVITES_COLLECTION), invite);
  recordAudit({ category: "org", action: "invite_created", orgId: params.orgId, details: { inviteId: ref.id } });
  return { id: ref.id, token };
}

export async function listInvitesForEmail(email: string): Promise<OrgInvite[]> {
  const q = query(collection(db, INVITES_COLLECTION), where("invitedEmail", "==", email), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as OrgInvite) }));
}

export async function acceptInvite(inviteId: string, uid: string) {
  const ref = doc(db, INVITES_COLLECTION, inviteId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("Invite not found");
  const data = snapshot.data() as OrgInvite;
  if (data.status !== "pending") throw new Error("Invite not pending");
  if (new Date(data.expiresAt).getTime() < Date.now()) throw new Error("Invite expired");
  await updateDoc(ref, { status: "accepted", invitedUid: uid });
  recordAudit({ category: "org", action: "invite_accepted", orgId: data.orgId, uid, details: { inviteId } });
  return data;
}

export async function declineInvite(inviteId: string, uid: string) {
  const ref = doc(db, INVITES_COLLECTION, inviteId);
  await updateDoc(ref, { status: "declined", invitedUid: uid });
  recordAudit({ category: "org", action: "invite_declined", uid, details: { inviteId } });
}
