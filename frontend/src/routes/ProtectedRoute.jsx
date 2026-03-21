import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // ✅ Bypass authentication in development
  if (process.env.NODE_ENV === "development") {
    return <Outlet />;
  }

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>
      Checking authentication...
    </div>;
  }

  if (!isAuthenticated) {
    alert("Please login first!");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
