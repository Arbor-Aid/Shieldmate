export type ApprovalStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED';

export type RegulatedActionType = 'GOOGLE_ADS_CHANGE';

export type ApprovalRecord = {
  approvalId: string;
  orgId: string;
  type: RegulatedActionType;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
