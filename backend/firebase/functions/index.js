import * as functions from "firebase-functions";
import admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const allowedRoles = ["super_admin", "org_admin", "staff", "case_worker", "client"];

const normalizeClaimRoles = (claims = {}) => {
  const roleSet = new Set();
  if (Array.isArray(claims.roles)) {
    claims.roles.forEach((role) => {
      if (typeof role === "string" && role.length > 0) {
        roleSet.add(role);
      }
    });
  }
  if (typeof claims.role === "string" && claims.role.length > 0) {
    roleSet.add(claims.role);
  }
  return Array.from(roleSet);
};

const resolveClaimOrgId = (orgId, orgRoles = {}) => {
  const orgIds = Object.keys(orgRoles).filter((value) => value.length > 0);

  if (typeof orgId === "string" && orgId.length > 0) {
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

export const setUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const callerClaims = context.auth.token || {};
  const callerRoles = normalizeClaimRoles(callerClaims);
  if (!callerRoles.includes("super_admin")) {
    throw new functions.https.HttpsError("permission-denied", "Only super_admin may issue roles.");
  }

  const { uid, orgId, roles = [], orgRoles = {} } = data || {};
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid is required.");
  }
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Self-escalation is not allowed.");
  }

  const validateRoles = (list) => {
    if (!Array.isArray(list)) return [];
    list.forEach((r) => {
      if (!allowedRoles.includes(r)) {
        throw new functions.https.HttpsError("invalid-argument", `Invalid role: ${r}`);
      }
    });
    return list;
  };

  const safeRoles = validateRoles(roles);
  const safeOrgRoles = {};

  Object.entries(orgRoles || {}).forEach(([candidateOrgId, roleList]) => {
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

  const legacyRole =
    safeRoles.find((role) => role.length > 0) ||
    (resolvedOrgId
      ? safeOrgRoles[resolvedOrgId]?.find((role) => role.length > 0)
      : undefined);
  const claims = {
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

  await admin.auth().setCustomUserClaims(uid, claims);

  await admin.firestore().collection("audits").add({
    uid: context.auth.uid,
    targetUid: uid,
    action: "set_user_claims",
    category: "auth",
    orgId: resolvedOrgId || null,
    claims,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    retentionDays: 365,
  });

  return { uid, claims };
});

const buildUiuxHandler = (kind) =>
  functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    let decoded = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        decoded = await admin.auth().verifyIdToken(authHeader.slice(7), true);
      } catch {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    const payload = req.body || {};
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

    const decodedRoles = Array.isArray(decoded?.roles)
      ? decoded.roles.filter((role) => typeof role === "string" && role.length > 0)
      : [];
    const actorRole = decodedRoles[0] || decoded?.role || null;
    const actorOrg = decoded?.orgId || decoded?.org || null;

    await admin.firestore().collection(kind === "audit" ? "ux_audits" : "ux_events").add({
      ...payload,
      source: "shieldmate-ui",
      actorUid: decoded ? decoded.uid : null,
      actorRole,
      actorOrg,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true, stored: true });
  });

export const uiuxAudit = buildUiuxHandler("audit");
export const uiuxEvent = buildUiuxHandler("event");
