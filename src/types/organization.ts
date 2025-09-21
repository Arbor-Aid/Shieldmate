
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  serviceType: string;
  lastContact?: string;
  createdAt: string;
  organizationId: string;
  needs?: string[];
  background?: string;
  notes?: ClientNote[];
  documents?: ClientDocument[];
  referredAt?: string;
  referredBy?: string;
  assignedTo?: string;
}

export interface ClientNote {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  size: number;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  address?: string;
  email: string;
  phone?: string;
  status: "active" | "pending" | "inactive";
  website?: string;
  contactPerson: string;
  createdAt: string;
  updatedAt?: any;
  clientCount: number;
  type: string;
  memberIds?: string[];
  services?: string[];
  faithBased?: boolean;
  servesWashtenaw?: boolean;
}

export interface Referral {
  id: string;
  clientName: string;
  clientId?: string;
  referredTo: string;
  referredToId: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  closedAt?: string;
  closedReason?: string;
}
