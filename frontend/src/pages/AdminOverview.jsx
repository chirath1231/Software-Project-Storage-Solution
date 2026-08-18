import React from "react";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers"; 
import AdminSubscriptionAnalytics from "./AdminSubscriptionAnalytics";
import AdminReports from "./AdminReports";
import AdminSubscriptionManager from "../components/components/AdminSubscriptionManager";
import { useAuth } from "../auth/AuthContext";
import { ShieldCheck, Info } from "lucide-react";

export default function AdminOverview() {
  const { hasPermission, isSuperUser, user } = useAuth();

  const canViewReports = hasPermission("reports.view");
  const canViewPayments = hasPermission("payments.view");
  const canManagePayments = hasPermission("payments.manage");
  const canViewUsers = hasPermission("users.view");

  const hasAnySection = canViewReports || canViewPayments || canManagePayments || canViewUsers;

  return (
    <div className="space-y-10 pb-16">
      {/* RBAC Scope Indicator Banner */}
      <div className="bg-white p-4 px-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">
              Active Admin Session: <span className="text-orange-600 font-extrabold">{user?.email}</span>
            </p>
            <p className="text-[11px] text-gray-400 font-medium">
              {isSuperUser ? "Full Super Admin Access" : `Assigned capabilities: ${user?.permissions?.length || 0} scope(s)`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {canViewReports && <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-black rounded-lg border border-purple-200 uppercase">Reports</span>}
          {canViewPayments && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-200 uppercase">Payments</span>}
          {canViewUsers && <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-200 uppercase">Users</span>}
        </div>
      </div>

      {!hasAnySection && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center max-w-lg mx-auto">
          <Info size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-800 mb-2">No Modules Assigned</h3>
          <p className="text-sm text-gray-500">
            Your restricted admin account does not currently have permissions assigned for any overview panels. Contact a Super Admin to request access.
          </p>
        </div>
      )}

      {/* Dashboard Section */}
      {canViewReports && (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <AdminDashboard />
        </section>
      )}

      {/* Subscription Analytics Section */}
      {canViewPayments && (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <AdminSubscriptionAnalytics />
        </section>
      )}

      {/* Subscription Plan Management Section */}
      {canManagePayments && (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <AdminSubscriptionManager />
        </section>
      )}

      {/* Reports & Performance Section */}
      {canViewReports && (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <AdminReports />
        </section>
      )}

      {/* Users Management Section */}
      {canViewUsers && (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <AdminUsers />
        </section>
      )}
    </div>
  );
}