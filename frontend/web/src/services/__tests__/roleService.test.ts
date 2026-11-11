jest.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
}));

import {
  parseRoleClaims,
  resolveEffectiveRoleFromClaims,
} from "@/services/roleService";

describe("roleService claims alignment", () => {
  it("preserves all valid org memberships when orgId is present", () => {
    const claims = parseRoleClaims({
      orgId: "org-a",
      roles: ["client"],
      orgRoles: {
        "org-a": ["case_worker"],
        "org-b": ["org_admin"],
      },
    });

    expect(claims.activeOrgId).toBe("org-a");
    expect(claims.org?.["org-a"]).toEqual(
      expect.arrayContaining(["case_worker", "client"])
    );
    expect(claims.org?.["org-b"]).toEqual(["org_admin"]);
  });

  it("keeps super_admin global and ignores it inside orgRoles", () => {
    const claims = parseRoleClaims({
      roles: ["super_admin"],
      orgRoles: {
        "org-a": ["super_admin", "client"],
      },
    });

    expect(claims.global).toEqual(["super_admin"]);
    expect(claims.org?.["org-a"]).toEqual(["client"]);
  });

  it("does not treat a legacy role as global authority", () => {
    const claims = parseRoleClaims({ role: "admin" });

    expect(claims.global).toEqual([]);
    expect(claims.org).toEqual({});
  });

  it("fails closed when multiple orgs have no active context", () => {
    const claims = parseRoleClaims({
      orgRoles: {
        "org-a": ["org_admin"],
        "org-b": ["client"],
      },
    });

    expect(resolveEffectiveRoleFromClaims(claims)).toBeNull();
    expect(resolveEffectiveRoleFromClaims(claims, "org-a")).toBe(
      "organization"
    );
  });

  it("supports case_worker as an organization-scoped role", () => {
    const claims = parseRoleClaims({
      orgId: "org-a",
      orgRoles: {
        "org-a": ["case_worker"],
      },
    });

    expect(resolveEffectiveRoleFromClaims(claims)).toBe("organization");
  });
});
