import * as functions from "firebase-functions";
import { getApps, initializeApp } from "firebase-admin/app";
import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

const auth = getAuth();
const firestore = getFirestore();

type Role = "super_admin" | "org_admin" | "staff" | "case_worker" | "client";

interface SetUserClaimsInput {
  uid: string;
  orgId?: string;
  roles?: Role[];
  orgRoles?: Record<string, Role[]>;
}

const allowedRoles: Role[] = ["super_admin", "org_admin", "staff", "case_worker", "client"];

const normalizeClaimRoles = (claims: { roles?: unknown }): string[] => {
  const roleSet = new Set<string>();
  if (Array.isArray(claims.roles)) {
    claims.roles.forEach((role) => {
      if (typeof role === "string" && role.length > 0) {
        roleSet.add(role);
      }
    });
  }
  return Array.from(roleSet);
};

const resolveClaimOrgId = (orgId?: string, orgRoles: Record<string, Role[]> = {}): string | undefined => {
  const orgIds = Object.keys(orgRoles).filter((value) => value.length > 0);

  if (orgId && orgId.length > 0) {
    if (orgIds.length > 0 && !orgIds.includes(orgId)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "orgId must identify one of the supplied orgRoles memberships.",
      );
    }
    return orgId;
  }

  if (orgIds.length > 1) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "orgId is required when assigning roles for multiple organizations.",
    );
  }

  return orgIds[0];
};

export const setUserClaims = functions.https.onCall(async (request) => {
  const callerAuth = request.auth;
  const data = request.data as SetUserClaimsInput;
  if (!callerAuth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const callerClaims = callerAuth.token as { roles?: unknown };
  const callerRoles = normalizeClaimRoles(callerClaims);
  if (!callerRoles.includes("super_admin")) {
    throw new functions.https.HttpsError("permission-denied", "Only super_admin may issue roles.");
  }

  const { uid, orgId, roles = [], orgRoles = {} } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid is required.");
  }

  if (uid === callerAuth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Self-escalation is not allowed.");
  }

  // Validate roles
  const validateRoles = (list?: Role[]) => {
    if (!list) return [];
    if (!Array.isArray(list)) {
      throw new functions.https.HttpsError("invalid-argument", "Roles must be an array.");
    }
    list.forEach((r) => {
      if (!allowedRoles.includes(r)) {
        throw new functions.https.HttpsError("invalid-argument", `Invalid role: ${r}`);
      }
    });
    return list;
  };

  const safeRoles = validateRoles(roles);
  const safeOrgRoles: Record<string, Role[]> = {};

  if (!orgRoles || typeof orgRoles !== "object" || Array.isArray(orgRoles)) {
    throw new functions.https.HttpsError("invalid-argument", "orgRoles must be an object.");
  }

  Object.entries(orgRoles).forEach(([candidateOrgId, roleList]) => {
    if (!candidateOrgId) {
      throw new functions.https.HttpsError("invalid-argument", "Organization IDs cannot be empty.");
    }

    const candidateRoles = validateRoles(roleList);
    if (candidateRoles.includes("super_admin")) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "super_admin is a global role and cannot appear in orgRoles.",
      );
    }

    safeOrgRoles[candidateOrgId] = candidateRoles;
  });

  const resolvedOrgId = resolveClaimOrgId(orgId, safeOrgRoles);
  if (safeRoles.some((role) => role !== "super_admin") && !resolvedOrgId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "orgId is required for organization-scoped roles.",
    );
  }

  const organizationIds = Array.from(new Set([
    ...(resolvedOrgId ? [resolvedOrgId] : []),
    ...Object.keys(safeOrgRoles),
  ]));
  if (organizationIds.length > 0) {
    const refs = organizationIds.map((candidateOrgId) =>
      firestore.collection("organizations").doc(candidateOrgId));
    const snapshots = await firestore.getAll(...refs);
    const missingOrg = snapshots.find((snapshot) => !snapshot.exists);
    if (missingOrg) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unknown organization: ${missingOrg.id}`,
      );
    }
  }

  const legacyRole =
    safeRoles.find((role) => role !== "super_admin") ??
    (resolvedOrgId
      ? safeOrgRoles[resolvedOrgId]?.find((role) => role.length > 0)
      : undefined);

  const claims: {
    roles: Role[];
    orgRoles: Record<string, Role[]>;
    orgId?: string;
    role?: Role;
    org?: string;
  } = {
    roles: safeRoles,
    orgRoles: safeOrgRoles,
  };
  if (resolvedOrgId) {
    claims.orgId = resolvedOrgId;
    claims.org = resolvedOrgId;
  }
  if (legacyRole) {
    claims.role = legacyRole;
  }

  await auth.setCustomUserClaims(uid, claims);

  const auditRef = firestore.collection("audits");
  await auditRef.add({
    uid: callerAuth.uid,
    targetUid: uid,
    action: "set_user_claims",
    category: "auth",
    orgId: resolvedOrgId ?? null,
    claims,
    timestamp: FieldValue.serverTimestamp(),
    retentionDays: 365,
  });

  return { uid, claims };
});

type UiuxPayload = {
  route?: string;
  userRole?: string;
  timestamp?: string;
  componentList?: string[];
  eventType?: string;
  metadata?: Record<string, unknown>;
};

const buildUiuxHandler = (kind: "audit" | "event") =>
  functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    let decoded: DecodedIdToken | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        decoded = await auth.verifyIdToken(authHeader.slice(7), true);
      } catch {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    const payload = (req.body ?? {}) as UiuxPayload;
    const uiuxUrl = process.env.UIUX_MCP_URL;
    if (uiuxUrl) {
      const target = `${uiuxUrl.replace(/\/$/, "")}/${kind}`;
      const upstream = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.UIUX_MCP_TOKEN
            ? { Authorization: `Bearer ${process.env.UIUX_MCP_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });
      res.status(upstream.ok ? 200 : 502).json({ ok: upstream.ok });
      return;
    }

    const decodedRoles = Array.isArray((decoded as { roles?: unknown } | null)?.roles)
      ? ((decoded as { roles?: unknown }).roles as unknown[]).filter(
          (role): role is string => typeof role === "string" && role.length > 0,
        )
      : [];
    const actorRole =
      decodedRoles[0] ??
      (((decoded as { role?: string } | null)?.role as string | undefined) ?? null);
    const actorOrg =
      (((decoded as { orgId?: string } | null)?.orgId as string | undefined) ??
        ((decoded as { org?: string } | null)?.org as string | undefined) ??
        null);

    await firestore.collection(kind === "audit" ? "ux_audits" : "ux_events").add({
      ...payload,
      source: "shieldmate-ui",
      actorUid: decoded?.uid ?? null,
      actorRole,
      actorOrg,
      receivedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true, stored: true });
  });

export const uiuxAudit = buildUiuxHandler("audit");
export const uiuxEvent = buildUiuxHandler("event");
