import admin from 'firebase-admin';

export type VerifiedTokenClaims = {
  uid: string;
  roles?: string[];
  orgRoles?: Record<string, string[]>;
  orgId?: string;
  role?: string;
  org?: string;
  email?: string;
};

type DecodedFirebaseToken = {
  uid: string;
  email?: string;
  roles?: unknown;
  role?: unknown;
  orgId?: unknown;
  org?: unknown;
  orgRoles?: unknown;
};

export type FirebaseTokenVerifier = (token: string) => Promise<DecodedFirebaseToken>;

let appInitialized = false;
const REJECTED_DEVELOPMENT_TOKEN = 'dev-token';

function initAdmin() {
  if (appInitialized) return;
  admin.initializeApp();
  appInitialized = true;
}

const verifyWithFirebase: FirebaseTokenVerifier = async (token) => {
  initAdmin();
  return admin.auth().verifyIdToken(token, true) as Promise<DecodedFirebaseToken>;
};

export function normalizeFirebaseClaims(decoded: DecodedFirebaseToken): VerifiedTokenClaims {
  if (typeof decoded.uid !== 'string' || decoded.uid.length === 0) {
    throw new Error('Invalid Firebase token claims');
  }

  const rolesFromToken = Array.isArray(decoded.roles)
    ? decoded.roles.filter((role): role is string => typeof role === 'string' && role.length > 0)
    : [];
  const orgRolesFromToken =
    decoded.orgRoles && typeof decoded.orgRoles === 'object' && !Array.isArray(decoded.orgRoles)
      ? Object.entries(decoded.orgRoles as Record<string, unknown>).reduce<Record<string, string[]>>(
          (acc, [orgKey, roleList]) => {
            if (!orgKey || !Array.isArray(roleList)) {
              return acc;
            }
            const filteredRoles = roleList.filter(
              (role): role is string => typeof role === 'string' && role.length > 0
            );
            if (filteredRoles.length > 0) {
              acc[orgKey] = Array.from(new Set(filteredRoles));
            }
            return acc;
          },
          {}
        )
      : {};
  const legacyRole =
    typeof decoded.role === 'string' && decoded.role.length > 0 ? decoded.role : undefined;
  const orgId =
    typeof decoded.orgId === 'string' && decoded.orgId.length > 0
      ? decoded.orgId
      : typeof decoded.org === 'string' && decoded.org.length > 0
        ? decoded.org
        : undefined;

  return {
    uid: decoded.uid,
    roles: Array.from(new Set(rolesFromToken)),
    orgRoles: orgRolesFromToken,
    orgId,
    role: legacyRole,
    org: orgId,
    email: typeof decoded.email === 'string' ? decoded.email : undefined,
  };
}

export async function verifyFirebaseToken(
  authHeader?: string,
  verifier: FirebaseTokenVerifier = verifyWithFirebase
): Promise<VerifiedTokenClaims> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new Error('Missing Firebase ID token');
  }
  if (token === REJECTED_DEVELOPMENT_TOKEN) {
    throw new Error('Development tokens are not accepted');
  }

  return normalizeFirebaseClaims(await verifier(token));
}
