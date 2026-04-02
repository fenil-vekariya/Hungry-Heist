import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role?.toLowerCase())) {
    if (role?.toLowerCase() === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role?.toLowerCase() === "restaurant") return <Navigate to="/restaurant-dashboard" replace />;
    return <Navigate to="/menu" replace />;
  }

  return children;
}

export default ProtectedRoute;

