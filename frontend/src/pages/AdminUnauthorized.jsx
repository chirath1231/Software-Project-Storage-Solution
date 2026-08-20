import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function AdminUnauthorized({ requiredPermission }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
          <ShieldAlert size={40} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-4">
          <Lock size={12} /> Access Restricted
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Insufficient Permissions
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your admin account (<strong className="text-gray-700">{user?.email || "Restricted Admin"}</strong>) does not have the required capability to view or manage this section.
        </p>

        {requiredPermission && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-6 text-xs text-gray-600">
            <span className="font-bold text-gray-400 uppercase tracking-widest block text-[10px] mb-1">Required Permission</span>
            <code className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-mono font-bold">
              {Array.isArray(requiredPermission) ? requiredPermission.join(" OR ") : requiredPermission}
            </code>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/admin/overview"
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <LayoutDashboard size={18} />
            Go to Admin Overview
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
