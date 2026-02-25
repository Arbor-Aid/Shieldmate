import admin from 'firebase-admin';

export type VerifiedTokenClaims = {
  uid: string;
  roles?: string[];
  orgId?: string;
  role?: string;
  org?: string;
  email?: string;
};

let appInitialized = false;

function initAdmin() {
  if (appInitialized) return;
  admin.initializeApp();
  appInitialized = true;
}

export async function verifyFirebaseToken(authHeader?: string): Promise<VerifiedTokenClaims> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }
  initAdmin();
  const token = authHeader.slice('Bearer '.length);
  const decoded = await admin.auth().verifyIdToken(token, true);
  const decodedAny = decoded as admin.auth.DecodedIdToken & {
    roles?: unknown;
    role?: unknown;
    orgId?: unknown;
    org?: unknown;
  };
  const rolesFromToken = Array.isArray(decodedAny.roles)
    ? decodedAny.roles.filter((role): role is string => typeof role === 'string' && role.length > 0)
    : [];
  const legacyRole =
    typeof decodedAny.role === 'string' && decodedAny.role.length > 0 ? decodedAny.role : undefined;
  const mergedRoles = legacyRole ? Array.from(new Set([...rolesFromToken, legacyRole])) : rolesFromToken;
  const orgId =
    typeof decodedAny.orgId === 'string' && decodedAny.orgId.length > 0
      ? decodedAny.orgId
      : typeof decodedAny.org === 'string' && decodedAny.org.length > 0
        ? decodedAny.org
        : undefined;

  return {
    uid: decoded.uid,
    roles: mergedRoles,
    orgId,
    role: legacyRole ?? mergedRoles[0],
    org: orgId,
    email: decoded.email,
  };
}
