/**
 * ShieldMate TradeOps / LC / Treasury types (placeholder-safe)
 * NOTE: Storage blobs should live in Firebase Storage; Firestore stores storagePath only.
 */

export type AccessScope = "org" | "case_manager" | "super_admin";

export interface BaseDoc {
  orgId: string;
  createdBy: string;
  createdAt: string; // ISO
  status: string;
  retentionUntil: string; // ISO (now + 5 years default)
  accessScope: AccessScope;
}

export interface TradeShipment extends BaseDoc {
  shipmentId: string;
  incoterms?: string;
  originCountry?: string;
  destinationCountry?: string;
}

export interface TradeShipmentDocument extends BaseDoc {
  docId: string;
  shipmentId: string;
  type: string;
  storagePath: string;
}

export interface TradeShipmentEvent extends BaseDoc {
  eventId: string;
  shipmentId: string;
  kind: string;
  details?: Record<string, any>;
}

export interface LcCase extends BaseDoc {
  lcId: string;
  applicant?: string;
  beneficiary?: string;
  amount?: number;
  currency?: string;
  usanceDays?: number;
}

export interface LcRequirement extends BaseDoc {
  reqId: string;
  lcId: string;
  name: string;
  due?: string;
}

export interface LcDocument extends BaseDoc {
  docId: string;
  lcId: string;
  type: string;
  storagePath: string;
}

export interface LcDiscrepancy extends BaseDoc {
  discId: string;
  lcId: string;
  docType: string;
  issue: string;
}

export interface LcEvent extends BaseDoc {
  eventId: string;
  lcId: string;
  kind: string;
  details?: Record<string, any>;
}

export interface TreasuryBatch extends BaseDoc {
  batchId: string;
  period: string; // e.g. 2026-01
  profit: number;
}

export interface TreasuryAllocation extends BaseDoc {
  allocationId: string;
  batchId: string;
  bucket: "investing" | "ops" | "reserve";
  amount: number;
}

export interface TreasuryPolicy extends BaseDoc {
  orgId: string;
  investingPct: number;
  opsPct: number;
  reservePct: number;
  approvalThreshold: number;
  maxPerAssetPct?: number;
  maxCryptoPct?: number;
  drawdownStopPct?: number;
  minHoldDays?: number;
}

export interface ProductPolicy extends BaseDoc {
  orgId: string;
  allowed: string[];
  conditional: string[];
  blocked: string[];
}

export interface InvestmentUniverse extends BaseDoc {
  orgId: string;
  tickers: string[];
  updatedAt: string;
}

export interface InvestmentRecommendation extends BaseDoc {
  recId: string;
  cashAvailable: number;
  universeTickers: string[];
  rankedCandidates: Array<{ ticker: string; score: number }>;
  recommendedOrders: Array<{ ticker: string; assetType: string; side: "buy"|"sell"; notional: number; rationale: string; confidence: number }>;
  warnings: string[];
  approvalRequired: boolean;
}

export interface TradeOrder extends BaseDoc {
  orderId: string;
  ticker: string;
  assetType: string;
  side: "buy" | "sell";
  notional: number;
  status: "pending_approval" | "approved" | "executed" | "cancelled" | string;
}

export interface TradeApproval extends BaseDoc {
  approvalId: string;
  orderId: string;
  approverUid: string;
  approverEmail: string;
  approvedAt: string;
}

export interface TrainingSop extends BaseDoc {
  sopId: string;
  title: string;
  steps: string[];
}

export interface AuditPacket extends BaseDoc {
  packetId: string;
  entityType: string;
  entityId: string;
  correlationId: string;
}
