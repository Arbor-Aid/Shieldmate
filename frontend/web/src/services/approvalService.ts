import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { auth, db, getAppCheckToken, getCurrentIdToken } from "@/lib/firebase";
import type {
  ApprovalEventType,
  ApprovalExecution,
  ApprovalStatus,
} from "@/types/approvals";
import type { GoogleAdsActionPayload } from "@/types/googleAds";

export type ApprovalDoc = {
  id: string;
  orgId: string;
  type: "GOOGLE_ADS_CHANGE";
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  payload: GoogleAdsActionPayload;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  executedAt?: Timestamp;
  execution?: ApprovalExecution;
};

type FetchFilters = {
  orgId: string;
  status?: ApprovalStatus;
  type?: "GOOGLE_ADS_CHANGE";
};

const approvalsRef = () => collection(db, "approvals");
const auditLogsRef = () => collection(db, "auditLogs");

export async function createApprovalDraft(params: {
  orgId: string;
  payload: GoogleAdsActionPayload;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated.");

  const docRef = await addDoc(approvalsRef(), {
    orgId: params.orgId,
    type: "GOOGLE_ADS_CHANGE",
    status: "DRAFT",
    requestedBy: user.uid,
    payload: params.payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await recordApprovalAudit({
    orgId: params.orgId,
    eventType: "APPROVAL_CREATED",
    targetId: docRef.id,
  });

  return docRef.id;
}

export async function submitApproval(approvalId: string, orgId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated.");

  await updateDoc(doc(db, "approvals", approvalId), {
    status: "PENDING",
    updatedAt: serverTimestamp(),
  });

  await recordApprovalAudit({
    orgId,
    eventType: "APPROVAL_SUBMITTED",
    targetId: approvalId,
  });
}

export async function approveApproval(approvalId: string, orgId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated.");

  await updateDoc(doc(db, "approvals", approvalId), {
    status: "APPROVED",
    approvedBy: user.uid,
    updatedAt: serverTimestamp(),
  });

  await recordApprovalAudit({
    orgId,
    eventType: "APPROVAL_APPROVED",
    targetId: approvalId,
  });
}

export async function rejectApproval(approvalId: string, orgId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated.");

  await updateDoc(doc(db, "approvals", approvalId), {
    status: "REJECTED",
    approvedBy: user.uid,
    updatedAt: serverTimestamp(),
  });

  await recordApprovalAudit({
    orgId,
    eventType: "APPROVAL_REJECTED",
    targetId: approvalId,
  });
}

export async function recordExecutionAttempt(params: {
  approvalId: string;
  orgId: string;
  execution: ApprovalExecution;
  success: boolean;
}) {
  await updateDoc(doc(db, "approvals", params.approvalId), {
    execution: params.execution,
    updatedAt: serverTimestamp(),
    ...(params.success ? { executedAt: serverTimestamp() } : {}),
  });

  await recordApprovalAudit({
    orgId: params.orgId,
    eventType: "EXECUTION_REQUESTED",
    targetId: params.approvalId,
    metadata: params.execution,
  });
}

export async function fetchApprovals(filters: FetchFilters) {
  const constraints = [
    where("orgId", "==", filters.orgId),
    orderBy("createdAt", "desc"),
    limit(50),
  ];
  if (filters.status) {
    constraints.unshift(where("status", "==", filters.status));
  }
  if (filters.type) {
    constraints.unshift(where("type", "==", filters.type));
  }
  const snapshot = await getDocs(query(approvalsRef(), ...constraints));
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ApprovalDoc, "id">),
  }));
}

export async function recordApprovalAudit(params: {
  orgId: string;
  eventType: ApprovalEventType;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated.");

  await addDoc(auditLogsRef(), {
    orgId: params.orgId,
    eventType: params.eventType,
    actorUid: user.uid,
    targetId: params.targetId,
    metadata: params.metadata ?? null,
    createdAt: serverTimestamp(),
  });
}

const normalizeGateway = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.replace(/\/$/, "");
  return trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
};

const readEnv = (key: string): string | undefined => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
};

const resolveGatewayEndpoint = () => {
  return normalizeGateway(
    readEnv("VITE_MCP_GATEWAY") || readEnv("VITE_MCP_ENDPOINT")
  );
};

export async function requestGatewayExecution(params: {
  orgId: string;
  toolId: string;
  input: Record<string, unknown>;
  meta?: Record<string, unknown>;
}) {
  const endpoint = resolveGatewayEndpoint();
  if (!endpoint) {
    throw new Error("Gateway endpoint not configured.");
  }

  const token = await getCurrentIdToken(false);
  const appCheckToken = await getAppCheckToken();

  const response = await fetch(`${endpoint}/mcp/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
    },
    body: JSON.stringify({
      toolId: params.toolId,
      orgId: params.orgId,
      input: params.input,
      meta: params.meta ?? {},
    }),
  });

  const bodyText = await response.text();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : null;
  } catch {
    parsed = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data: parsed,
    raw: bodyText,
  };
}
