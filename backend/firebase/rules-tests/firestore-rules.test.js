import fs from "node:fs";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const rulesPath = fileURLToPath(new URL("../../../firestore.rules", import.meta.url));
const productionRules = fs.readFileSync(rulesPath, "utf8");

// The rules unit-test SDK cannot attach an App Check token. Keep one environment on
// the exact production rules to prove missing App Check fails closed, then use
// an in-memory-only replacement to represent a request that already passed the
// App Check gate while exercising every remaining authorization rule.
const rulesAfterAppCheck = productionRules.replace(
  "return request.app != null;",
  "return true; // TEST HARNESS ONLY: App Check already validated"
);

if (rulesAfterAppCheck === productionRules) {
  throw new Error("Unable to locate the App Check gate in firestore.rules");
}

let appCheckEnvironment;
let authorizationEnvironment;

const pendingApproval = {
  orgId: "org-a",
  type: "GOOGLE_ADS_CHANGE",
  status: "PENDING",
  requestedBy: "requester-a",
  payload: { campaignId: "SIMULATED-CAMPAIGN" },
  createdAt: "2026-10-26T12:00:00Z",
  updatedAt: "2026-10-26T12:00:00Z",
};

before(async () => {
  appCheckEnvironment = await initializeTestEnvironment({
    projectId: "demo-shieldmate-app-check",
    firestore: { rules: productionRules },
  });
  authorizationEnvironment = await initializeTestEnvironment({
    projectId: "demo-shieldmate-authorization",
    firestore: { rules: rulesAfterAppCheck },
  });

  for (const environment of [appCheckEnvironment, authorizationEnvironment]) {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "approvals", "approval-a"), pendingApproval);
    });
  }
});

after(async () => {
  await Promise.all([
    appCheckEnvironment?.cleanup(),
    authorizationEnvironment?.cleanup(),
  ]);
});

function approvalRef(context) {
  return doc(context.firestore(), "approvals", "approval-a");
}

function orgAdminContext(orgId = "org-a", uid = `admin-${orgId}`) {
  return authorizationEnvironment.authenticatedContext(uid, {
    roles: ["org_admin"],
    orgId,
    orgRoles: { [orgId]: ["org_admin"] },
  });
}

test("denies authenticated requests when App Check is absent", async () => {
  const context = appCheckEnvironment.authenticatedContext("admin-org-a", {
    roles: ["org_admin"],
    orgId: "org-a",
    orgRoles: { "org-a": ["org_admin"] },
  });
  await assertFails(getDoc(approvalRef(context)));
});

test("allows the documented org admin approval transition after App Check", async () => {
  const context = orgAdminContext();
  await assertSucceeds(updateDoc(approvalRef(context), {
    status: "APPROVED",
    approvedBy: "admin-org-a",
    updatedAt: "2026-10-26T12:01:00Z",
  }));

  await authorizationEnvironment.withSecurityRulesDisabled(async (adminContext) => {
    await setDoc(doc(adminContext.firestore(), "approvals", "approval-a"), pendingApproval);
  });
});

test("denies cross-organization approval access", async () => {
  await assertFails(getDoc(approvalRef(orgAdminContext("org-b"))));
});

test("does not treat nested super_admin as global authority", async () => {
  const context = authorizationEnvironment.authenticatedContext("nested-super", {
    orgRoles: { "org-a": ["super_admin"] },
  });
  await assertFails(getDoc(approvalRef(context)));
});

test("denies malformed nested role claims", async () => {
  const context = authorizationEnvironment.authenticatedContext("malformed-admin", {
    orgId: "org-a",
    roles: ["org_admin"],
    orgRoles: { "org-a": "org_admin" },
  });
  await assertFails(getDoc(approvalRef(context)));
});

test("denies approval changes by a non-approver", async () => {
  const context = authorizationEnvironment.authenticatedContext("requester-a", {
    roles: ["staff"],
    orgId: "org-a",
    orgRoles: { "org-a": ["staff"] },
  });
  await assertFails(updateDoc(approvalRef(context), {
    status: "APPROVED",
    approvedBy: "requester-a",
    updatedAt: "2026-10-26T12:02:00Z",
  }));
});

test("denies invalid PENDING to EXECUTED transition", async () => {
  await assertFails(updateDoc(approvalRef(orgAdminContext()), {
    status: "EXECUTED",
    execution: { result: "SIMULATED" },
    executedAt: "2026-10-26T12:03:00Z",
    updatedAt: "2026-10-26T12:03:00Z",
  }));
});

test("denies alteration of immutable decision fields", async () => {
  await assertFails(updateDoc(approvalRef(orgAdminContext()), {
    status: "APPROVED",
    approvedBy: "admin-org-a",
    payload: { campaignId: "TAMPERED" },
    updatedAt: "2026-10-26T12:04:00Z",
  }));
});
