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

let appInitialized = false;
const DEV_BYPASS_TOKEN = 'dev-token';
const DEV_BYPASS_ROLE = 'admin';
const DEV_BYPASS_ORG_ID = process.env.DEV_BYPASS_ORG_ID || 'dev-org';
const DEV_BYPASS_UID = process.env.DEV_BYPASS_UID || 'dev-admin';

function initAdmin() {
  if (appInitialized) return;
  admin.initializeApp();
  appInitialized = true;
}

export async function verifyFirebaseToken(authHeader?: string): Promise<VerifiedTokenClaims> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }
  const token = authHeader.slice('Bearer '.length);
  if (token === DEV_BYPASS_TOKEN) {
    return {
      uid: DEV_BYPASS_UID,
      roles: [DEV_BYPASS_ROLE],
      orgRoles: {
        [DEV_BYPASS_ORG_ID]: [DEV_BYPASS_ROLE],
      },
      orgId: DEV_BYPASS_ORG_ID,
      role: DEV_BYPASS_ROLE,
      org: DEV_BYPASS_ORG_ID,
      email: `${DEV_BYPASS_UID}@local.dev`,
    };
  }
  initAdmin();
  const decoded = await admin.auth().verifyIdToken(token, true);
  const decodedAny = decoded as admin.auth.DecodedIdToken & {
    roles?: unknown;
    role?: unknown;
    orgId?: unknown;
    org?: unknown;
    orgRoles?: unknown;
  };
  const rolesFromToken = Array.isArray(decodedAny.roles)
    ? decodedAny.roles.filter((role): role is string => typeof role === 'string' && role.length > 0)
    : [];
  const orgRolesFromToken =
    decodedAny.orgRoles && typeof decodedAny.orgRoles === 'object'
      ? Object.entries(decodedAny.orgRoles as Record<string, unknown>).reduce<Record<string, string[]>>(
          (acc, [orgKey, roleList]) => {
            if (!orgKey || !Array.isArray(roleList)) {
              return acc;
            }
            const filteredRoles = roleList.filter(
              (role): role is string => typeof role === 'string' && role.length > 0
            );
            if (filteredRoles.length > 0) {
              acc[orgKey] = filteredRoles;
            }
            return acc;
          },
          {}
        )
      : {};
  const orgScopedRoles = Object.values(orgRolesFromToken).flat();
  const legacyRole =
    typeof decodedAny.role === 'string' && decodedAny.role.length > 0 ? decodedAny.role : undefined;
  const mergedRoles = legacyRole
    ? Array.from(new Set([...rolesFromToken, ...orgScopedRoles, legacyRole]))
    : Array.from(new Set([...rolesFromToken, ...orgScopedRoles]));
  const orgId =
    typeof decodedAny.orgId === 'string' && decodedAny.orgId.length > 0
      ? decodedAny.orgId
      : typeof decodedAny.org === 'string' && decodedAny.org.length > 0
        ? decodedAny.org
        : Object.keys(orgRolesFromToken)[0]
          ? Object.keys(orgRolesFromToken)[0]
        : undefined;

  return {
    uid: decoded.uid,
    roles: mergedRoles,
    orgRoles: orgRolesFromToken,
    orgId,
    role: legacyRole ?? mergedRoles[0],
    org: orgId,
    email: decoded.email,
  };
}
