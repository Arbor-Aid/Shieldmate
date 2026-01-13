
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/firebase";
import { UserRole } from "@/services/roleService";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: RoleBasedRouteProps) => {
  const { userRole, loading } = useRoleAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && userRole && !allowedRoles.includes(userRole)) {
      toast({
        title: "Access Denied",
        description: `You don't have the necessary permissions to access this area.`,
        variant: "destructive",
      });
      
      trackEvent('access_denied', {
        path: location.pathname,
        userRole,
        requiredRoles: allowedRoles,
      });
    }
  }, [userRole, loading, allowedRoles, toast, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  // User is not authenticated or doesn't have required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
