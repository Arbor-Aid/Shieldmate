export type Role = 'super_admin' | 'org_admin' | 'case_worker';

export type VerifiedTokenClaims = {
  uid: string;
  role?: Role;
  org?: string;
  email?: string;
};

export type AuthzContext = {
  token: VerifiedTokenClaims;
  isRole: (role: Role) => boolean;
  hasOrg: (orgId: string) => boolean;
};
