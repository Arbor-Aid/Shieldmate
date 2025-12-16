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
