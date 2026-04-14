import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

type Role = "super_admin" | "org_admin" | "staff" | "case_worker" | "client";

type OrgRoleClaims = Record<string, Role[]>;

interface AssignRoleParams {
  uid: string;
  roles?: Role[];
  orgRoles?: OrgRoleClaims;
}

export async function assignCustomClaims(params: AssignRoleParams) {
  const { uid, roles = [], orgRoles = {} } = params;
  const safeRoles = roles.filter(Boolean);

  // Validate role names
  const allowed: Role[] = ["super_admin", "org_admin", "staff", "case_worker", "client"];
  safeRoles.forEach((r) => {
    if (!allowed.includes(r)) {
      throw new Error(`Invalid role: ${r}`);
    }
  });
  Object.values(orgRoles).forEach((roleList) =>
    roleList.forEach((r) => {
      if (!allowed.includes(r)) {
        throw new Error(`Invalid org role: ${r}`);
      }
    })
  );

  const claimOrgId = Object.keys(orgRoles).find((orgId) => orgId.length > 0);
  const legacyRole = safeRoles.find((role) => role.length > 0);
  const customClaims: {
    roles: Role[];
    orgRoles: OrgRoleClaims;
    orgId?: string;
    org?: string;
    role?: Role;
  } = {
    roles: safeRoles,
    orgRoles,
  };
  if (claimOrgId) {
    customClaims.orgId = claimOrgId;
    customClaims.org = claimOrgId;
  }
  if (legacyRole) {
    customClaims.role = legacyRole;
  }

  await admin.auth().setCustomUserClaims(uid, customClaims);
  return { uid, claims: customClaims };
}
