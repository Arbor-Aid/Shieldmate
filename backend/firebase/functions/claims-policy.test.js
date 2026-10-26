import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAuthorizedAssignment,
  buildCustomClaims,
  callerHasGlobalSuperAdmin,
} from "./claims-policy.js";

test("only canonical roles can grant caller global super_admin", () => {
  assert.equal(callerHasGlobalSuperAdmin({ roles: ["super_admin"] }), true);
  assert.equal(callerHasGlobalSuperAdmin({ role: "super_admin" }), false);
  assert.equal(callerHasGlobalSuperAdmin({ orgRoles: { orgA: ["super_admin"] } }), false);
  assert.equal(callerHasGlobalSuperAdmin({ admin: true }), false);
});

test("rejects unauthorized issuers and self-escalation", () => {
  assert.throws(
    () => assertAuthorizedAssignment({ role: "super_admin" }, "caller", "target"),
    /canonical global super_admin/
  );
  assert.throws(
    () => assertAuthorizedAssignment({ roles: ["super_admin"] }, "caller", "caller"),
    /Self-escalation/
  );
  assert.doesNotThrow(
    () => assertAuthorizedAssignment({ roles: ["super_admin"] }, "caller", "target")
  );
});

test("builds organization-scoped and legacy compatibility claims", () => {
  assert.deepEqual(
    buildCustomClaims({
      uid: "target",
      orgId: "org-a",
      roles: ["staff"],
      orgRoles: { "org-a": ["org_admin"] },
    }),
    {
      uid: "target",
      claims: {
        roles: ["staff"],
        orgRoles: { "org-a": ["org_admin"] },
        orgId: "org-a",
        org: "org-a",
        role: "staff",
      },
      organizationIds: ["org-a"],
    }
  );
});

test("rejects nested super_admin and missing or ambiguous organization scope", () => {
  assert.throws(
    () => buildCustomClaims({ uid: "target", orgRoles: { "org-a": ["super_admin"] } }),
    /cannot appear in orgRoles/
  );
  assert.throws(
    () => buildCustomClaims({ uid: "target", roles: ["org_admin"] }),
    /orgId is required/
  );
  assert.throws(
    () => buildCustomClaims({
      uid: "target",
      orgRoles: { "org-a": ["staff"], "org-b": ["client"] },
    }),
    /orgId is required/
  );
});

test("rejects malformed role payloads", () => {
  assert.throws(() => buildCustomClaims({ uid: "target", roles: "super_admin" }), /must be an array/);
  assert.throws(() => buildCustomClaims({ uid: "target", orgRoles: [] }), /must be an object/);
});
