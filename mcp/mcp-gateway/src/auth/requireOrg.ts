import { verifyFirebaseToken, VerifiedTokenClaims } from './verifyFirebaseToken';

export async function requireOrg(
  authHeader: string | undefined,
  expectedOrg: string | undefined,
  claims?: VerifiedTokenClaims
): Promise<VerifiedTokenClaims> {
  const resolvedClaims = claims ?? (await verifyFirebaseToken(authHeader));
  if (!(resolvedClaims.roles?.length) && !resolvedClaims.role) {
    throw new Error('Missing role claim');
  }
  const orgClaim = resolvedClaims.orgId ?? resolvedClaims.org;
  if (!orgClaim) {
    throw new Error('Missing org claim');
  }
  if (expectedOrg && orgClaim !== expectedOrg) {
    throw new Error('Org mismatch');
  }
  return {
    ...resolvedClaims,
    orgId: orgClaim,
    org: orgClaim,
  };
}
