import { verifyFirebaseToken, VerifiedTokenClaims } from './verifyFirebaseToken';

const SUPER_ADMIN = 'super_admin';

export async function requireRole(
  authHeader: string | undefined,
  allowedRoles: string[]
): Promise<VerifiedTokenClaims> {
  const claims = await verifyFirebaseToken(authHeader);
  const roleSet = new Set<string>();
  (claims.roles ?? []).forEach((role) => roleSet.add(role));
  if (claims.role) {
    roleSet.add(claims.role);
  }
  const normalizedRoles = Array.from(roleSet);

  if (normalizedRoles.length === 0) {
    throw new Error('Missing role claim');
  }
  if (normalizedRoles.includes(SUPER_ADMIN)) {
    return claims;
  }
  if (!allowedRoles.some((role) => normalizedRoles.includes(role))) {
    throw new Error('Insufficient role');
  }
  return claims;
}
