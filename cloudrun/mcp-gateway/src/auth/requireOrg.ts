import { verifyFirebaseToken, VerifiedTokenClaims } from './verifyFirebaseToken';

export async function requireOrg(
  authHeader: string | undefined,
  expectedOrg: string | undefined,
  claims?: VerifiedTokenClaims
): Promise<VerifiedTokenClaims> {
  const resolvedClaims = claims ?? (await verifyFirebaseToken(authHeader));
  if (!resolvedClaims.role) {
    throw new Error('Missing role claim');
  }
  if (!resolvedClaims.org) {
    throw new Error('Missing org claim');
  }
  if (expectedOrg && resolvedClaims.org !== expectedOrg) {
    throw new Error('Org mismatch');
  }
  return resolvedClaims;
}
