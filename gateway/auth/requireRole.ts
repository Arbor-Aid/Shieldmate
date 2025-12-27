import { verifyFirebaseToken } from './verifyFirebaseToken';

// Placeholder: enforce role from decoded token.
export async function requireRole(
  authHeader: string | undefined,
  requiredRole: string
) {
  const decoded = await verifyFirebaseToken(authHeader);
  if (decoded.role !== requiredRole) {
    throw new Error('Forbidden');
  }
  return decoded;
}
