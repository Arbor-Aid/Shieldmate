import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

type Role = "super_admin" | "org_admin" | "staff" | "case_worker" | "client";

type OrgRoleClaims = Record<string, Role[]>;

interface AssignRoleParams {
  uid: string;
  orgId?: string;
  roles?: Role[];
  orgRoles?: OrgRoleClaims;
}

export async function assignCustomClaims(params: AssignRoleParams) {
  const { uid, orgId, roles = [], orgRoles = {} } = params;
  const safeRoles = roles.filter(Boolean);

  // Validate role names
  const allowed: Role[] = ["super_admin", "org_admin", "staff", "case_worker", "client"];
  safeRoles.forEach((r) => {
    if (!allowed.includes(r)) {
      throw new Error(`Invalid role: ${r}`);
    }
  });
  Object.entries(orgRoles).forEach(([candidateOrgId, roleList]) => {
    if (!candidateOrgId) {
      throw new Error("Organization IDs cannot be empty.");
    }

    roleList.forEach((role) => {
      if (!allowed.includes(role)) {
        throw new Error(`Invalid org role: ${role}`);
      }
      if (role === "super_admin") {
        throw new Error("super_admin is a global role and cannot appear in orgRoles.");
      }
    });
  });

  const orgIds = Object.keys(orgRoles);
  if (orgId && orgIds.length > 0 && !orgIds.includes(orgId)) {
    throw new Error("orgId must identify one of the supplied orgRoles memberships.");
  }
  if (!orgId && orgIds.length > 1) {
    throw new Error("orgId is required when assigning roles for multiple organizations.");
  }

  const claimOrgId = orgId || orgIds[0];
  if (safeRoles.some((role) => role !== "super_admin") && !claimOrgId) {
    throw new Error("orgId is required for organization-scoped roles.");
  }

  const legacyRole =
    safeRoles.find((role) => role.length > 0) ??
    (claimOrgId
      ? orgRoles[claimOrgId]?.find((role) => role.length > 0)
      : undefined);
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
