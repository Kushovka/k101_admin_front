import React, { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    window.location.href = "/sign-in";
    return null;
  }

  if (role && userRole !== role) {
    window.location.href = "/sign-in";
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
