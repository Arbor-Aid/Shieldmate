import { verifyFirebaseToken, VerifiedTokenClaims } from './verifyFirebaseToken';

const SUPER_ADMIN = 'super_admin';

export async function requireOrg(
  authHeader: string | undefined,
  requiredOrg: string,
  claims?: VerifiedTokenClaims
): Promise<VerifiedTokenClaims> {
  const resolvedClaims = claims ?? (await verifyFirebaseToken(authHeader));
  if (!resolvedClaims.role) {
    throw new Error('Missing role claim');
  }
  if (resolvedClaims.role === SUPER_ADMIN) {
    return resolvedClaims;
  }
  if (!resolvedClaims.org || resolvedClaims.org !== requiredOrg) {
    throw new Error('Org mismatch');
  }
  return resolvedClaims;
}
