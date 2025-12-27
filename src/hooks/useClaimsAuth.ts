import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleClaims, RoleClaims, UserRole } from "@/services/roleService";

type ClaimsAccess = {
  claims: RoleClaims | null;
  orgIds: string[];
  orgAdminOrgs: string[];
  isSuperAdmin: boolean;
  loading: boolean;
};

const hasOrgRole = (roles: UserRole[] | undefined, role: UserRole) =>
  (roles ?? []).includes(role);

export function useClaimsAuth(): ClaimsAccess {
  const { currentUser, loading } = useAuth();
  const [claims, setClaims] = useState<RoleClaims | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!currentUser || loading) {
      setClaims(null);
      return;
    }

    setClaimsLoading(true);
    getRoleClaims(currentUser)
      .then((next) => {
        if (active) setClaims(next);
      })
      .finally(() => {
        if (active) setClaimsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser, loading]);

  const orgEntries = Object.entries(claims?.org ?? {});
  const orgIds = orgEntries.map(([orgId]) => orgId);
  const orgAdminOrgs = orgEntries
    .filter(([, roles]) => hasOrgRole(roles, "org_admin"))
    .map(([orgId]) => orgId);

  return {
    claims,
    orgIds,
    orgAdminOrgs,
    isSuperAdmin: claims?.global?.includes("super_admin") ?? false,
    loading: loading || claimsLoading,
  };
}
