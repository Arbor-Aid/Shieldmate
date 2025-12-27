import { verifyFirebaseToken } from './verifyFirebaseToken';

// Placeholder: enforce org from decoded token.
export async function requireOrg(
  authHeader: string | undefined,
  requiredOrg: string
) {
  const decoded = await verifyFirebaseToken(authHeader);
  if (decoded.org !== requiredOrg) {
    throw new Error('Forbidden');
  }
  return decoded;
}
