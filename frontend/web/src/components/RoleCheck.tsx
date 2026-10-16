
import { ReactNode } from "react";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { doesEffectiveRoleSatisfyAny, UserRole } from "@/services/roleService";

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

  const hasAllowedRole = doesEffectiveRoleSatisfyAny(userRole, allowedRoles);

  if (loading) {
    return null;
  }

  if (!userRole || !hasAllowedRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleCheck;
