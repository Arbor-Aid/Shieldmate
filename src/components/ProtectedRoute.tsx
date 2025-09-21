
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/firebase";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      
      // Track access attempt to protected route
      trackEvent('auth_redirect', {
        from: location.pathname,
        authenticated: false
      });
    }
  }, [currentUser, loading, toast, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Track successful access to protected route
  useEffect(() => {
    if (currentUser) {
      trackEvent('protected_route_access', {
        route: location.pathname,
        userId: currentUser.uid
      });
    }
  }, [currentUser, location.pathname]);

  return <>{children}</>;
};

export default ProtectedRoute;
