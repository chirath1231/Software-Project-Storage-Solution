import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AdminUnauthorized from "../pages/AdminUnauthorized";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ requiredPermission, children }) {
  const { user, isAdmin, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Authenticating Admin Scope...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not an admin -> Redirect to normal user dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If a specific capability permission is required, verify fine-grained RBAC
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AdminUnauthorized requiredPermission={requiredPermission} />;
  }

  return children ? children : <Outlet />;
}
