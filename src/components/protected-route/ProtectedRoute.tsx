import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children}) => {
  const token = localStorage.getItem("admin_access_token");
  const userRole = localStorage.getItem("admin_role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
