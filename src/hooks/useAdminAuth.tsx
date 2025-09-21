
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUserAdmin } from "@/services/adminService";

export function useAdminAuth() {
  const { currentUser, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['adminStatus', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return false;
      return await isUserAdmin(currentUser.uid);
    },
    enabled: !!currentUser && !authLoading,
    staleTime: 5 * 60 * 1000, // Cache admin status for 5 minutes
    retry: 1,
  });

  return { 
    isAdmin, 
    loading: isLoading || authLoading 
  };
}
