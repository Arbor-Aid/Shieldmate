
import { Client, Organization } from "./organization";

export interface AdminMetrics {
  totalClients: number;
  totalOrganizations: number;
  activeOrganizations: number;
  pendingRequests: number;
}

export interface AgentReport {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "new" | "reviewed" | "archived";
  category: string;
}

export interface FeedbackFlag {
  id: string;
  organizationId: string;
  organizationName: string;
  message: string;
  createdAt: string;
  status: "new" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
}

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super-admin";
}

export interface AnalyticsMetrics {
  userEngagement: {
    date: string;
    value: number;
  }[];
  referralTypes: {
    type: string;
    count: number;
  }[];
  profileCompletions: number;
  documentUploads: number;
}
