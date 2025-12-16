import * as functions from "firebase-functions";
import admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const allowedRoles = ["super_admin", "org_admin", "staff", "client"];

export const setUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  const callerClaims = context.auth.token || {};
  if (!Array.isArray(callerClaims.roles) || !callerClaims.roles.includes("super_admin")) {
    throw new functions.https.HttpsError("permission-denied", "Only super_admin may issue roles.");
  }

  const { uid, roles = [], orgRoles = {} } = data || {};
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
  Object.entries(orgRoles || {}).forEach(([orgId, roleList]) => {
    safeOrgRoles[orgId] = validateRoles(roleList);
  });

  const claims = {
    roles: safeRoles,
    orgRoles: safeOrgRoles,
  };

  await admin.auth().setCustomUserClaims(uid, claims);

  await admin.firestore().collection("audits").add({
    uid: context.auth.uid,
    targetUid: uid,
    action: "set_user_claims",
    category: "auth",
    orgId: data.orgId || null,
    claims,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    retentionDays: 365,
  });

  return { uid, claims };
});
