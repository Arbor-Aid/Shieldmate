
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

  if (loading) {
    return null;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleCheck;
