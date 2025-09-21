
import { ReactNode } from "react";
import RoleBasedRoute from "./RoleBasedRoute";

interface OrganizationRouteProps {
  children: ReactNode;
}

const OrganizationRoute = ({ children }: OrganizationRouteProps) => {
  return (
    <RoleBasedRoute allowedRoles={["organization", "admin"]}>
      {children}
    </RoleBasedRoute>
  );
};

export default OrganizationRoute;
