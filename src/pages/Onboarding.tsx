import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import { useAuth } from "@/hooks/useAuth";
import { listInvitesForEmail, acceptInvite, declineInvite, OrgInvite } from "@/services/inviteService";
import { recordAudit } from "@/lib/audit";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.email) return;
      try {
        const pending = await listInvitesForEmail(currentUser.email);
        setInvites(pending);
        if (pending.length === 0) {
          navigate("/profile");
        }
      } catch (e) {
        setError("Unable to load invites");
      }
    };
    load();
  }, [currentUser, navigate]);

  const handleAccept = async (inviteId: string) => {
    if (!currentUser?.uid) return;
    await acceptInvite(inviteId, currentUser.uid);
    recordAudit({ category: "org", action: "invite_accept", uid: currentUser.uid, details: { inviteId } });
    navigate("/org");
  };

  const handleDecline = async (inviteId: string) => {
    if (!currentUser?.uid) return;
    await declineInvite(inviteId, currentUser.uid);
    recordAudit({ category: "org", action: "invite_decline", uid: currentUser.uid, details: { inviteId } });
    setInvites((list) => list.filter((i) => i.id !== inviteId));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationWithNotifications />
        <main className="container mx-auto py-10 px-4 space-y-4">
          <h1 className="text-2xl font-bold">Pending Invites</h1>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {invites.length === 0 && <p className="text-sm text-muted-foreground">No pending invites.</p>}
          <div className="grid gap-3">
            {invites.map((invite) => (
              <div key={invite.id} className="border rounded-lg p-4 bg-card/50">
                <p className="font-semibold">Organization: {invite.orgId}</p>
                <p className="text-sm text-muted-foreground">Roles: {invite.roles.join(", ")}</p>
                <p className="text-xs text-muted-foreground">Expires: {invite.expiresAt}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="px-3 py-2 rounded bg-primary text-primary-foreground"
                    onClick={() => handleAccept(invite.id!)}
                  >
                    Accept
                  </button>
                  <button
                    className="px-3 py-2 rounded border"
                    onClick={() => handleDecline(invite.id!)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Onboarding;
