import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";

export type UserRole =
  | "super_admin"
  | "org_admin"
  | "staff"
  | "case_worker"
  | "client"
  // legacy roles
  | "admin"
  | "organization";

const knownRoles: readonly UserRole[] = [
  "super_admin",
  "org_admin",
  "staff",
  "case_worker",
  "client",
  "admin",
  "organization",
];

export interface RoleClaims {
  global?: UserRole[];
  org?: Record<string, UserRole[]>;
  activeOrgId?: string;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" &&
    (knownRoles as readonly string[]).includes(value);
}

export function doesEffectiveRoleSatisfy(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  if (userRole === requiredRole) return true;
  if (requiredRole === "admin" && userRole === "super_admin") return true;
  if (
    requiredRole === "organization" &&
    (userRole === "org_admin" ||
      userRole === "staff" ||
      userRole === "case_worker")
  ) {
    return true;
  }
  if (
    (requiredRole === "org_admin" ||
      requiredRole === "staff" ||
      requiredRole === "case_worker") &&
    userRole === "organization"
  ) {
    return true;
  }
  return false;
}

export function doesEffectiveRoleSatisfyAny(
  userRole: UserRole | null | undefined,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.some((role) =>
    doesEffectiveRoleSatisfy(userRole, role)
  );
}

export function parseRoleClaims(
  claims: Record<string, unknown>
): RoleClaims {
  const canonicalRoles = Array.isArray(claims.roles)
    ? claims.roles.filter(isUserRole)
    : [];

  const activeOrgId =
    typeof claims.orgId === "string" && claims.orgId.length > 0
      ? claims.orgId
      : typeof claims.org === "string" && claims.org.length > 0
        ? claims.org
        : undefined;

  const orgRoleMap: Record<string, UserRole[]> = {};

  const addOrgRoles = (orgId: string, roles: UserRole[]) => {
    if (!orgId) return;

    const scopedRoles = roles.filter((role) => role !== "super_admin");
    if (scopedRoles.length === 0) return;

    orgRoleMap[orgId] = Array.from(
      new Set([...(orgRoleMap[orgId] ?? []), ...scopedRoles])
    );
  };

  if (
    claims.orgRoles &&
    typeof claims.orgRoles === "object" &&
    !Array.isArray(claims.orgRoles)
  ) {
    Object.entries(
      claims.orgRoles as Record<string, unknown>
    ).forEach(([orgId, value]) => {
      if (!Array.isArray(value)) return;
      addOrgRoles(orgId, value.filter(isUserRole));
    });
  }

  if (activeOrgId) {
    addOrgRoles(
      activeOrgId,
      canonicalRoles.filter((role) => role !== "super_admin")
    );

    if (isUserRole(claims.role) && claims.role !== "super_admin") {
      addOrgRoles(activeOrgId, [claims.role]);
    }
  }

  return {
    global: canonicalRoles.filter((role) => role === "super_admin"),
    org: orgRoleMap,
    activeOrgId,
  };
}

export async function getRoleClaims(
  user?: User | null
): Promise<RoleClaims | null> {
  const current = user ?? auth.currentUser;
  if (!current) return null;

  const token = await current.getIdTokenResult();
  return parseRoleClaims(
    (token.claims ?? {}) as Record<string, unknown>
  );
}

export function hasRoleClaim(
  claims: RoleClaims | null,
  role: UserRole,
  orgId?: string
): boolean {
  if (!claims) return false;
  if (orgId && claims.org?.[orgId]?.includes(role)) return true;
  return claims.global?.includes(role) ?? false;
}

export function resolveEffectiveRoleFromClaims(
  claims: RoleClaims | null,
  orgId?: string
): UserRole | null {
  if (!claims) return null;

  if (claims.global?.includes("super_admin")) {
    return "super_admin";
  }

  const orgRoleMap = claims.org ?? {};
  let selectedOrgId = orgId ?? claims.activeOrgId;

  if (!selectedOrgId) {
    const orgIds = Object.keys(orgRoleMap);
    if (orgIds.length !== 1) return null;
    selectedOrgId = orgIds[0];
  }

  const roles = orgRoleMap[selectedOrgId] ?? [];
  const preferredRole =
    roles.find((role) => role === "org_admin") ??
    roles.find((role) => role === "staff") ??
    roles.find((role) => role === "case_worker") ??
    roles.find((role) => role === "organization") ??
    roles.find((role) => role === "admin") ??
    roles.find((role) => role === "client");

  return preferredRole ? normalizeRole(preferredRole) : null;
}

export async function resolveEffectiveRole(
  user?: User | null,
  orgId?: string
): Promise<UserRole | null> {
  const claims = await getRoleClaims(user);
  return resolveEffectiveRoleFromClaims(claims, orgId);
}

function normalizeRole(role: UserRole): UserRole {
  if (
    role === "org_admin" ||
    role === "staff" ||
    role === "case_worker"
  ) {
    return "organization";
  }
  return role;
}
