import { getFunctions, httpsCallable } from "firebase/functions";
import { appCheck } from "@/lib/firebase";
import { recordAudit } from "@/lib/audit";

export type AssignRoleInput = {
  uid: string;
  roles?: string[];
  orgRoles?: Record<string, string[]>;
};

export async function assignRoles(input: AssignRoleInput) {
  const functions = getFunctions();
  const callable = httpsCallable(functions, "setUserClaims");
  try {
    const result = await callable(input);
    recordAudit({ category: "org", action: "assign_role", uid: input.uid, details: input });
    return result.data;
  } catch (error) {
    recordAudit({ category: "error", action: "assign_role_failed", uid: input.uid, error: String(error) });
    throw error;
  }
}
