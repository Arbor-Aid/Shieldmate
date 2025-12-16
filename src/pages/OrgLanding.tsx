import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleCheck from "@/components/RoleCheck";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import { listOrgMembers, getOrganization, getUserOrganizations, addOrgMember } from "@/services/orgAccessService";
import { useAuth } from "@/hooks/useAuth";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { recordAudit } from "@/lib/audit";
import { HealthPanel } from "@/components/HealthPanel";

const OrgLanding = () => {
  const { currentUser } = useAuth();
  const { hasOrgRole } = useRoleAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newMemberUid, setNewMemberUid] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("staff");

  const canManage = useMemo(() => orgId && currentUser && hasOrgRole(orgId, "org_admin"), [orgId, currentUser, hasOrgRole]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const memberships = await getUserOrganizations(currentUser.uid);
        if (memberships.length > 0) {
          setOrgId(memberships[0].orgId);
        }
      } catch (e) {
        setError("Unable to resolve organization membership.");
      }
    })();
  }, [currentUser]);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      try {
        const org = await getOrganization(orgId);
        setOrgName(org?.name ?? orgId);
        const list = await listOrgMembers(orgId);
        setMembers(list);
      } catch (e) {
        setError("Unable to load organization data.");
      }
    })();
  }, [orgId]);

  // Allow manual entry if org discovery fails
  const [manualOrgId, setManualOrgId] = useState("");

  const handleManualLoad = async () => {
    setOrgId(manualOrgId);
    recordAudit({ category: "org", action: "manual_org_select", orgId: manualOrgId });
  };

  return (
    <ProtectedRoute>
      <RoleCheck allowedRoles={["organization", "staff", "admin", "org_admin", "super_admin"]}>
        <div className="min-h-screen bg-background">
          <NavigationWithNotifications />
          <main className="container mx-auto py-10 px-4 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold">Organization Workspace</h1>
                <p className="text-muted-foreground">
                  Org-level dashboards and partner tools. Scoped per organization and role.
                </p>
              </div>
              <HealthPanel />
            </div>

            {!orgId && (
              <div className="border rounded-lg p-4 space-y-3 bg-card/50">
                <p className="text-sm text-muted-foreground">
                  No organization detected. Enter an organization ID to continue.
                </p>
                <div className="flex gap-2">
                  <input
                    className="border rounded px-3 py-2 bg-background w-full"
                    placeholder="org_123"
                    value={manualOrgId}
                    onChange={(e) => setManualOrgId(e.target.value)}
                  />
                  <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={handleManualLoad}>
                    Load
                  </button>
                </div>
              </div>
            )}

            {orgId && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2">Overview</h2>
                  <p className="text-sm text-muted-foreground">Organization: {orgName}</p>
                  <p className="text-sm text-muted-foreground">Org ID: {orgId}</p>
                  {canManage ? (
                    <p className="text-xs text-emerald-700 mt-2">You can manage memberships for this org.</p>
                  ) : (
                    <p className="text-xs text-amber-700 mt-2">Read-only access.</p>
                  )}
                </div>
                <div className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2">Members</h2>
                  {members.length === 0 && <p className="text-sm text-muted-foreground">No members loaded.</p>}
                  <ul className="space-y-2">
                    {members.map((m) => (
                      <li key={m.uid} className="flex items-center justify-between text-sm">
                        <span>{m.uid}</span>
                        <span className="text-muted-foreground">{m.roles?.join(", ")}</span>
                      </li>
                    ))}
                  </ul>
                  {canManage && orgId && (
                    <div className="mt-4 space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="border rounded px-3 py-2 bg-background w-full"
                          placeholder="User UID"
                          value={newMemberUid}
                          onChange={(e) => setNewMemberUid(e.target.value)}
                        />
                        <select
                          className="border rounded px-2 py-2 bg-background"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                        >
                          <option value="org_admin">org_admin</option>
                          <option value="staff">staff</option>
                          <option value="client">client</option>
                        </select>
                        <button
                          className="px-3 py-2 rounded bg-primary text-primary-foreground"
                          onClick={async () => {
                            if (!orgId) return;
                            await addOrgMember(orgId, { uid: newMemberUid, orgId, roles: [newMemberRole as any] });
                            recordAudit({ category: "org", action: "add_member", orgId, details: { uid: newMemberUid, role: newMemberRole } });
                            const refreshed = await listOrgMembers(orgId);
                            setMembers(refreshed);
                            setNewMemberUid("");
                          }}
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Assigns membership; claims update via admin tooling.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-600">{error}</div>}
          </main>
        </div>
      </RoleCheck>
    </ProtectedRoute>
  );
};

export default OrgLanding;
