import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isPublicRoute } from "@/lib/routes";

type AuditEvent = {
  category: "auth" | "mcp" | "org" | "ui" | "error";
  action: string;
  uid?: string;
  orgId?: string;
  resource?: string;
  details?: Record<string, unknown>;
  error?: string;
};

const isDev = import.meta.env.DEV;

export async function recordAudit(event: AuditEvent) {
  const uid = event.uid ?? auth.currentUser?.uid;
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isPublic = pathname ? isPublicRoute(pathname) : false;
  const audit = {
    ...event,
    uid,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    console.info("[AUDIT]", audit);
  }

  if (!uid || isPublic) return;

  try {
    await addDoc(collection(db, "audits"), audit);
  } catch (error) {
    if (isDev) {
      console.error("[AUDIT] failed to record", error);
    }
  }
}
