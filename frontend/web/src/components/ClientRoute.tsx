
import { ReactNode } from "react";
import RoleBasedRoute from "./RoleBasedRoute";

interface ClientRouteProps {
  children: ReactNode;
}

const ClientRoute = ({ children }: ClientRouteProps) => {
  return (
    <RoleBasedRoute allowedRoles={["client", "admin"]}>
      {children}
    </RoleBasedRoute>
  );
};

export default ClientRoute;
