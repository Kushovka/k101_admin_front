import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem("admin_access_token");
  const userRole = localStorage.getItem("admin_role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  // если пользователь не админ и пытается открыть админку
  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
