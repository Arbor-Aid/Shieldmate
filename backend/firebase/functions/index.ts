import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

type Role = "super_admin" | "org_admin" | "staff" | "client";

interface SetUserClaimsInput {
  uid: string;
  orgId?: string;
  roles?: Role[];
  orgRoles?: Record<string, Role[]>;
}

const allowedRoles: Role[] = ["super_admin", "org_admin", "staff", "client"];

export const setUserClaims = functions.https.onCall(async (data: SetUserClaimsInput, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const callerClaims = context.auth.token as { roles?: string[] };
  if (!callerClaims.roles || !callerClaims.roles.includes("super_admin")) {
    throw new functions.https.HttpsError("permission-denied", "Only super_admin may issue roles.");
  }

  const { uid, roles = [], orgRoles = {} } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid is required.");
  }

  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Self-escalation is not allowed.");
  }

  // Validate roles
  const validateRoles = (list?: Role[]) => {
    if (!list) return [];
    list.forEach((r) => {
      if (!allowedRoles.includes(r)) {
        throw new functions.https.HttpsError("invalid-argument", `Invalid role: ${r}`);
      }
    });
    return list;
  };

  const safeRoles = validateRoles(roles);
  const safeOrgRoles: Record<string, Role[]> = {};
  Object.entries(orgRoles).forEach(([orgId, roleList]) => {
    safeOrgRoles[orgId] = validateRoles(roleList);
  });

  const claims = {
    roles: safeRoles,
    orgRoles: safeOrgRoles,
  };

  await admin.auth().setCustomUserClaims(uid, claims);

  const auditRef = admin.firestore().collection("audits");
  await auditRef.add({
    uid: context.auth.uid,
    targetUid: uid,
    action: "set_user_claims",
    category: "auth",
    orgId: data.orgId ?? null,
    claims,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
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

    let decoded: admin.auth.DecodedIdToken | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        decoded = await admin.auth().verifyIdToken(authHeader.slice(7), true);
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

    await admin.firestore().collection(kind === "audit" ? "ux_audits" : "ux_events").add({
      ...payload,
      source: "shieldmate-ui",
      actorUid: decoded?.uid ?? null,
      actorRole: (decoded?.role as string | undefined) ?? null,
      actorOrg: (decoded?.org as string | undefined) ?? null,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true, stored: true });
  });

export const uiuxAudit = buildUiuxHandler("audit");
export const uiuxEvent = buildUiuxHandler("event");
