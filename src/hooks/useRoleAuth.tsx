import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getUserRole, getRoleClaims, hasRoleClaim, resolveEffectiveRole, UserRole } from "@/services/roleService";

export function useRoleAuth() {
  const { currentUser, loading: authLoading } = useAuth();

  const {
    data: claims,
    isLoading: claimsLoading,
  } = useQuery({
    queryKey: ["claims", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      return await getRoleClaims(currentUser);
    },
    enabled: !!currentUser && !authLoading,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: userRole,
    isLoading: roleLoading,
    refetch: refetchRole,
  } = useQuery({
    queryKey: ["userRole", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;

      const claimsRole = await resolveEffectiveRole(currentUser);
      if (claimsRole) return claimsRole;
      return await getUserRole(currentUser.uid);
    },
    enabled: !!currentUser && !authLoading,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const loading = authLoading || roleLoading || claimsLoading;

  const hasRole = (role: UserRole): boolean => {
    if (loading || !userRole) return false;
    if (role === "admin" && userRole === "super_admin") return true;
    if (role === "organization" && (userRole === "org_admin" || userRole === "staff")) return true;
    return userRole === role;
  };

  const hasOrgRole = (orgId: string, role: UserRole): boolean => {
    if (!currentUser) return false;
    return hasRoleClaim(claims ?? null, role, orgId);
  };

  return {
    userRole,
    isAdmin: hasRole("admin") || hasRole("super_admin"),
    isOrganization: hasRole("organization") || hasRole("org_admin"),
    isStaff: hasRole("staff"),
    isClient: hasRole("client"),
    hasOrgRole,
    loading,
    refetchRole,
  };
}
