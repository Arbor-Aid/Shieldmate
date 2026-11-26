import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleCheck from "@/components/RoleCheck";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import { assignRoles } from "@/services/rbacAdminClient";
import { addOrgMember } from "@/services/orgAccessService";
import { recordAudit } from "@/lib/audit";

const globalRoles = ["super_admin"];

const AdminRbac = () => {
  const [uid, setUid] = useState("");
  const [orgId, setOrgId] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [orgRoles, setOrgRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((r) => r !== value) : [...list, value]);
  };

  const handleAssign = async () => {
    setStatus(null);

    const targetUid = uid.trim();
    const targetOrgId = orgId.trim();

    if (!targetUid) {
      setStatus("User UID is required.");
      return;
    }
    if (orgRoles.length > 0 && !targetOrgId) {
      setStatus("Organization ID is required for organization roles.");
      return;
    }
    if (roles.length === 0 && orgRoles.length === 0) {
      setStatus("Select at least one role.");
      return;
    }

    try {
      await assignRoles({
        uid: targetUid,
        orgId: targetOrgId || undefined,
        roles,
        orgRoles:
          targetOrgId && orgRoles.length > 0
            ? { [targetOrgId]: orgRoles }
            : {},
      });

      if (targetOrgId && orgRoles.length > 0) {
        await addOrgMember(targetOrgId, {
          uid: targetUid,
          orgId: targetOrgId,
          roles: orgRoles as any,
          status: "active",
        });
      }

      setStatus("Updated claims and organization membership.");
      recordAudit({
        category: "org",
        action: "admin_assign_roles",
        uid: targetUid,
        orgId: targetOrgId,
        details: { roles, orgRoles },
      });
    } catch (error) {
      setStatus("Failed to update roles.");
      console.error(error);
    }
  };

  return (
    <ProtectedRoute>
      <RoleCheck allowedRoles={["admin", "staff", "organization", "super_admin"]} fallback={<div className="p-6">Access denied.</div>}>
        <div className="min-h-screen bg-background">
          <NavigationWithNotifications />
          <main className="container mx-auto py-8 px-4 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">RBAC Administration</h1>
              <p className="text-muted-foreground">Assign roles and organization memberships (admin-only).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4 space-y-3">
                <label className="text-sm font-medium">User UID</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="Firebase UID"
                />
                <label className="text-sm font-medium">Global Roles (super_admin only)</label>
                <div className="flex flex-wrap gap-2">
                  {globalRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => toggle(role, roles, setRoles)}
                      className={`px-3 py-1 rounded border ${roles.includes(role) ? "bg-primary text-primary-foreground" : "bg-card"}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <label className="text-sm font-medium">Organization ID (required for org roles)</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  placeholder="org_123"
                />
                <label className="text-sm font-medium">Org Roles</label>
                <div className="flex flex-wrap gap-2">
                  {["org_admin", "staff", "case_worker", "client"].map((role) => (
                    <button
                      key={role}
                      onClick={() => toggle(role, orgRoles, setOrgRoles)}
                      className={`px-3 py-1 rounded border ${orgRoles.includes(role) ? "bg-primary text-primary-foreground" : "bg-card"}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAssign}
                className="px-4 py-2 rounded bg-primary text-primary-foreground"
                disabled={!uid.trim() || (orgRoles.length > 0 && !orgId.trim()) || (roles.length === 0 && orgRoles.length === 0)}
              >
                Assign Roles
              </button>
              {status && <span className="text-sm text-muted-foreground">{status}</span>}
            </div>
          </main>
        </div>
      </RoleCheck>
    </ProtectedRoute>
  );
};

export default AdminRbac;
