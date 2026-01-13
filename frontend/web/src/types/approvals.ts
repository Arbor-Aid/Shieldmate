import type { GoogleAdsActionPayload } from "./googleAds";

export type ApprovalStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED";

export type RegulatedActionType = "GOOGLE_ADS_CHANGE";

export type ApprovalExecution = {
  toolId: string;
  gatewayRequestId?: string;
  resultStatus?: string;
  errorMessage?: string;
};

export type ApprovalRecord = {
  approvalId: string;
  orgId: string;
  type: RegulatedActionType;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  payload: GoogleAdsActionPayload;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  execution?: ApprovalExecution;
};

export type ApprovalEventType =
  | "APPROVAL_CREATED"
  | "APPROVAL_SUBMITTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "EXECUTION_REQUESTED"
  | "EXECUTION_MARKED";
