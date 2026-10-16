import { verifyFirebaseToken, VerifiedTokenClaims } from './verifyFirebaseToken';

const SUPER_ADMIN = 'super_admin';

export type AuthorizedOrgContext = {
  claims: VerifiedTokenClaims;
  org: string;
};

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function stringRoles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((role): role is string => typeof role === 'string' && role.length > 0);
}

export function authorizeClaimsForOrg(
  claims: VerifiedTokenClaims,
  allowedRoles: readonly string[],
  requestedOrgId?: unknown
): AuthorizedOrgContext {
  const canonicalRoles = stringRoles(claims.roles);
  const globalSuperAdmin = canonicalRoles.includes(SUPER_ADMIN);
  const explicitOrg = nonEmptyString(claims.orgId) ?? nonEmptyString(claims.org);
  const requestedOrg = nonEmptyString(requestedOrgId);
  const orgRoles =
    claims.orgRoles && typeof claims.orgRoles === 'object' && !Array.isArray(claims.orgRoles)
      ? claims.orgRoles
      : {};
  const orgRoleKeys = Object.keys(orgRoles).filter((orgId) => orgId.length > 0);

  let effectiveOrg: string | undefined;
  if (requestedOrg) {
    if (!globalSuperAdmin && requestedOrg !== explicitOrg && !orgRoleKeys.includes(requestedOrg)) {
      throw new Error('Org mismatch');
    }
    effectiveOrg = requestedOrg;
  } else if (explicitOrg) {
    effectiveOrg = explicitOrg;
  } else if (orgRoleKeys.length === 1) {
    effectiveOrg = orgRoleKeys[0];
  } else if (orgRoleKeys.length > 1) {
    throw new Error('Organization context is required');
  } else {
    throw new Error('Missing org claim');
  }

  if (globalSuperAdmin) {
    return { claims, org: effectiveOrg };
  }

  const effectiveRoles = new Set<string>(stringRoles(orgRoles[effectiveOrg]));
  if (explicitOrg === effectiveOrg) {
    canonicalRoles.forEach((role) => effectiveRoles.add(role));
    const legacyRole = nonEmptyString(claims.role);
    if (legacyRole) {
      effectiveRoles.add(legacyRole);
    }
  }

  if (effectiveRoles.size === 0) {
    throw new Error('Missing role claim for organization');
  }
  if (!allowedRoles.some((role) => effectiveRoles.has(role))) {
    throw new Error('Insufficient role for organization');
  }

  return { claims, org: effectiveOrg };
}

export async function requireRole(
  authHeader: string | undefined,
  allowedRoles: readonly string[],
  requestedOrgId?: unknown
): Promise<AuthorizedOrgContext> {
  const claims = await verifyFirebaseToken(authHeader);
  return authorizeClaimsForOrg(claims, allowedRoles, requestedOrgId);
}
