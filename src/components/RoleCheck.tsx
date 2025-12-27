
import { ReactNode } from "react";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { UserRole } from "@/services/roleService";

interface RoleCheckProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

const RoleCheck = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleCheckProps) => {
  const { userRole, loading } = useRoleAuth();

  const hasAllowedRole = allowedRoles.some((role) => {
    if (!userRole) return false;
    if (role === userRole) return true;
    if (role === "admin" && userRole === "super_admin") return true;
    if (role === "super_admin" && userRole === "admin") return true;
    if (role === "organization" && (userRole === "org_admin" || userRole === "staff")) return true;
    if ((role === "org_admin" || role === "staff") && userRole === "organization") return true;
    return false;
  });

  if (loading) {
    return null;
  }

  if (!userRole || !hasAllowedRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleCheck;
