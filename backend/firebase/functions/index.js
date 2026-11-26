import * as functions from "firebase-functions";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { assertAuthorizedAssignment, buildCustomClaims } from "./claims-policy.js";

if (getApps().length === 0) {
  initializeApp();
}

const auth = getAuth();
const firestore = getFirestore();

export const setUserClaims = functions.https.onCall(async (request) => {
  const { auth: callerAuth, data } = request;
  if (!callerAuth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  let assignment;
  try {
    assignment = buildCustomClaims(data || {});
  } catch (error) {
    throw new functions.https.HttpsError("invalid-argument", error.message);
  }
  const { uid, claims, organizationIds } = assignment;
  try {
    assertAuthorizedAssignment(callerAuth.token || {}, callerAuth.uid, uid);
  } catch (error) {
    throw new functions.https.HttpsError("permission-denied", error.message);
  }

  if (organizationIds.length > 0) {
    const refs = organizationIds.map((orgId) => firestore.collection("organizations").doc(orgId));
    const snapshots = await firestore.getAll(...refs);
    const missingOrg = snapshots.find((snapshot) => !snapshot.exists);
    if (missingOrg) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Unknown organization: ${missingOrg.id}`,
      );
    }
  }

  await auth.setCustomUserClaims(uid, claims);

  await firestore.collection("audits").add({
    uid: callerAuth.uid,
    targetUid: uid,
    action: "set_user_claims",
    category: "auth",
    orgId: claims.orgId || null,
    claims,
    timestamp: FieldValue.serverTimestamp(),
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
        decoded = await auth.verifyIdToken(authHeader.slice(7), true);
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

    await firestore.collection(kind === "audit" ? "ux_audits" : "ux_events").add({
      ...payload,
      source: "shieldmate-ui",
      actorUid: decoded ? decoded.uid : null,
      actorRole,
      actorOrg,
      receivedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true, stored: true });
  });

export const uiuxAudit = buildUiuxHandler("audit");
export const uiuxEvent = buildUiuxHandler("event");
