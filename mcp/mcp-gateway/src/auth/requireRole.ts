import { verifyFirebaseToken, VerifiedTokenClaims } from './verifyFirebaseToken';

const SUPER_ADMIN = 'super_admin';

export async function requireRole(
  authHeader: string | undefined,
  allowedRoles: string[]
): Promise<VerifiedTokenClaims> {
  const claims = await verifyFirebaseToken(authHeader);
  if (!claims.role) {
    throw new Error('Missing role claim');
  }
  if (claims.role === SUPER_ADMIN) {
    return claims;
  }
  if (!allowedRoles.includes(claims.role)) {
    throw new Error('Insufficient role');
  }
  return claims;
}
