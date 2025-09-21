
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getUserRole, UserRole } from "@/services/roleService";

export function useRoleAuth() {
  const { currentUser, loading: authLoading } = useAuth();

  const { 
    data: userRole, 
    isLoading: roleLoading,
    refetch: refetchRole
  } = useQuery({
    queryKey: ['userRole', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      return await getUserRole(currentUser.uid);
    },
    enabled: !!currentUser && !authLoading,
    staleTime: 5 * 60 * 1000, // Cache role for 5 minutes
    retry: 1,
  });

  const loading = authLoading || roleLoading;

  const hasRole = (role: UserRole): boolean => {
    if (loading || !userRole) return false;
    return userRole === role;
  };

  return { 
    userRole, 
    isAdmin: hasRole("admin"),
    isOrganization: hasRole("organization"),
    isClient: hasRole("client"), 
    loading,
    refetchRole
  };
}
