export type OrgRole = "org_admin" | "staff" | "client" | "viewer";

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  active?: boolean;
  status?: "active" | "pending" | "suspended";
}

export interface OrganizationMembership {
  uid: string;
  orgId: string;
  roles: OrgRole[];
  status?: "active" | "pending";
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
}
