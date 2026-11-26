export const allowedRoles = ["super_admin", "org_admin", "staff", "case_worker", "client"];

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const validateRoles = (value, fieldName) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${fieldName} must be an array.`);

  return Array.from(new Set(value.map((role) => {
    if (typeof role !== "string" || !allowedRoles.includes(role)) {
      throw new Error(`Invalid role in ${fieldName}: ${String(role)}`);
    }
    return role;
  })));
};

export const callerHasGlobalSuperAdmin = (claims = {}) =>
  Array.isArray(claims.roles) && claims.roles.includes("super_admin");

export function assertAuthorizedAssignment(callerClaims, callerUid, targetUid) {
  if (!callerHasGlobalSuperAdmin(callerClaims)) {
    throw new Error("Only canonical global super_admin may issue roles.");
  }
  if (callerUid === targetUid) {
    throw new Error("Self-escalation is not allowed.");
  }
}

export function buildCustomClaims(input = {}) {
  if (!isRecord(input)) throw new Error("Request payload must be an object.");

  const uid = typeof input.uid === "string" ? input.uid.trim() : "";
  if (!uid) throw new Error("uid is required.");

  const roles = validateRoles(input.roles, "roles");
  const rawOrgRoles = input.orgRoles === undefined ? {} : input.orgRoles;
  if (!isRecord(rawOrgRoles)) throw new Error("orgRoles must be an object.");

  const orgRoles = {};
  for (const [orgId, value] of Object.entries(rawOrgRoles)) {
    if (!orgId.trim()) throw new Error("Organization IDs cannot be empty.");
    const scopedRoles = validateRoles(value, `orgRoles.${orgId}`);
    if (scopedRoles.includes("super_admin")) {
      throw new Error("super_admin is a global role and cannot appear in orgRoles.");
    }
    orgRoles[orgId] = scopedRoles;
  }

  const suppliedOrgId =
    typeof input.orgId === "string" && input.orgId.trim() ? input.orgId.trim() : undefined;
  const orgIds = Object.keys(orgRoles);
  if (suppliedOrgId && orgIds.length > 0 && !orgIds.includes(suppliedOrgId)) {
    throw new Error("orgId must identify one of the supplied orgRoles memberships.");
  }
  if (!suppliedOrgId && orgIds.length > 1) {
    throw new Error("orgId is required when assigning roles for multiple organizations.");
  }

  const orgId = suppliedOrgId ?? orgIds[0];
  if (roles.some((role) => role !== "super_admin") && !orgId) {
    throw new Error("orgId is required for organization-scoped roles.");
  }

  const claims = { roles, orgRoles };
  if (orgId) {
    claims.orgId = orgId;
    claims.org = orgId;
    const legacyRole =
      roles.find((role) => role !== "super_admin") ?? orgRoles[orgId]?.[0];
    if (legacyRole) claims.role = legacyRole;
  }

  return {
    uid,
    claims,
    organizationIds: Array.from(new Set([...(orgId ? [orgId] : []), ...orgIds])),
  };
}
