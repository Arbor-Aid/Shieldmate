
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/firebase";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, loading } = useRoleAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      
      // Track unauthorized admin access attempt
      trackEvent('admin_access_attempt', {
        path: location.pathname,
        authorized: false
      });
    }
  }, [isAdmin, loading, toast, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Track successful admin access
  useEffect(() => {
    if (isAdmin) {
      trackEvent('admin_access', {
        path: location.pathname,
        authorized: true
      });
    }
  }, [isAdmin, location.pathname]);

  return <>{children}</>;
};

export default AdminRoute;
