import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuth = !!localStorage.getItem("access_token");
  if (!isAuth) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
