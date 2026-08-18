import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Search,
  Check,
  X,
  Save,
  Users,
  CreditCard,
  HardDrive,
  BarChart3,
  HelpCircle,
  Settings,
  Key,
  Loader2,
  RefreshCw,
  Info
} from "lucide-react";

export default function AdminPermissionsManager() {
  const { user: currentAuthUser, isSuperUser } = useAuth();

  const [permissions, setPermissions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingAdminId, setSavingAdminId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Local state for modified permissions of each admin
  const [localPermissions, setLocalPermissions] = useState({}); // { [adminId]: string[] }
  const [localSuperusers, setLocalSuperusers] = useState({}); // { [adminId]: boolean }

  useEffect(() => {
    fetchPermissionsData();
  }, []);

  const fetchPermissionsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/permissions/");
      const fetchedPerms = res.data.permissions || [];
      const fetchedAdmins = res.data.admins || [];

      setPermissions(fetchedPerms);
      setAdmins(fetchedAdmins);

      // Initialize local state mapping
      const permsMap = {};
      const superMap = {};
      fetchedAdmins.forEach((a) => {
        permsMap[a.id] = a.permissions.includes("*")
          ? fetchedPerms.map((p) => p.code)
          : a.permissions;
        superMap[a.id] = a.is_superuser;
      });

      setLocalPermissions(permsMap);
      setLocalSuperusers(superMap);
    } catch (err) {
      console.error("Failed to fetch permissions data:", err);
      setError(err.response?.data?.detail || "Failed to load permissions. Super Admin privileges required.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (adminId, permCode) => {
    const currentList = localPermissions[adminId] || [];
    const isChecked = currentList.includes(permCode);

    const updated = isChecked
      ? currentList.filter((c) => c !== permCode)
      : [...currentList, permCode];

    setLocalPermissions((prev) => ({
      ...prev,
      [adminId]: updated,
    }));
  };

  const handleToggleSuperuser = (adminId) => {
    const current = Boolean(localSuperusers[adminId]);
    const nextVal = !current;

    setLocalSuperusers((prev) => ({
      ...prev,
      [adminId]: nextVal,
    }));

    if (nextVal) {
      // If promoting to superuser, grant all permissions in UI
      setLocalPermissions((prev) => ({
        ...prev,
        [adminId]: permissions.map((p) => p.code),
      }));
    }
  };

  const applyPreset = (adminId, presetName) => {
    let presetCodes = [];
    let isSuper = false;

    switch (presetName) {
      case "SUPER_ADMIN":
        isSuper = true;
        presetCodes = permissions.map((p) => p.code);
        break;
      case "USER_ADMIN":
        presetCodes = ["users.view", "users.manage", "settings.view"];
        break;
      case "PAYMENT_ADMIN":
        presetCodes = ["payments.view", "payments.manage", "reports.view", "settings.view"];
        break;
      case "STORAGE_ADMIN":
        presetCodes = ["storage.view", "storage.manage", "settings.view"];
        break;
      case "SUPPORT_ADMIN":
        presetCodes = ["support.view", "support.manage", "users.view", "settings.view"];
        break;
      case "READ_ONLY":
        presetCodes = ["users.view", "payments.view", "storage.view", "reports.view", "support.view", "settings.view"];
        break;
      case "CLEAR_ALL":
        presetCodes = [];
        break;
      default:
        break;
    }

    setLocalSuperusers((prev) => ({ ...prev, [adminId]: isSuper }));
    setLocalPermissions((prev) => ({ ...prev, [adminId]: presetCodes }));
  };

  const handleSaveAdmin = async (adminId) => {
    setSavingAdminId(adminId);
    setFeedback(null);

    const adminPerms = localPermissions[adminId] || [];
    const isSuper = Boolean(localSuperusers[adminId]);

    try {
      const res = await api.put(`/api/admin/permissions/${adminId}/`, {
        permissions: adminPerms,
        is_superuser: isSuper,
      });

      setFeedback({
        type: "success",
        text: res.data.message || `Permissions saved successfully.`,
      });

      // Update admin in list
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === adminId
            ? {
                ...a,
                is_superuser: res.data.is_superuser,
                permissions: res.data.permissions,
              }
            : a
        )
      );

      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Save permissions error:", err);
      setFeedback({
        type: "error",
        text: err.response?.data?.detail || "Failed to update permissions.",
      });
    } finally {
      setSavingAdminId(null);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Users":
        return <Users size={14} className="text-blue-500" />;
      case "Payments":
        return <CreditCard size={14} className="text-emerald-500" />;
      case "Storage":
        return <HardDrive size={14} className="text-cyan-500" />;
      case "Reports":
        return <BarChart3 size={14} className="text-purple-500" />;
      case "Support":
        return <HelpCircle size={14} className="text-orange-500" />;
      case "Settings":
        return <Settings size={14} className="text-gray-500" />;
      case "Permissions":
        return <Key size={14} className="text-amber-500" />;
      default:
        return <Shield size={14} className="text-gray-400" />;
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Loading RBAC Authorization Matrix...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-red-900 mb-2">Access Forbidden</h2>
          <p className="text-sm text-red-700 font-medium mb-6">{error}</p>
          <button
            onClick={fetchPermissionsData}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-12 bg-orange-500 rounded-md"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Admin Permissions & <span className="text-orange-500">RBAC Matrix</span>
              </h1>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full flex items-center gap-1">
                <Crown size={14} /> Super Admin Only
              </span>
            </div>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Configure fine-grained capability permissions for administrative accounts
            </p>
          </div>
        </div>

        <button
          onClick={fetchPermissionsData}
          className="px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2 shadow-sm self-start"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl font-bold text-sm mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 shadow-md ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? <ShieldCheck size={20} className="text-emerald-500" /> : <ShieldAlert size={20} className="text-red-500" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Admin Staff</p>
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">{admins.length}</h3>
          <p className="text-xs text-gray-500 mt-1">Registered in system</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Super Admins</p>
          <h3 className="text-3xl font-black text-amber-600 tracking-tight">
            {admins.filter((a) => a.is_superuser).length}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Full system override</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Restricted Admins</p>
          <h3 className="text-3xl font-black text-blue-600 tracking-tight">
            {admins.filter((a) => !a.is_superuser).length}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Role-scoped access</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Permission Capabilities</p>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{permissions.length}</h3>
          <p className="text-xs text-gray-500 mt-1">Across {categories.length} functional modules</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search admins by email or username..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all border border-gray-100 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Admins Matrix Cards */}
      <div className="space-y-8">
        {filteredAdmins.map((admin) => {
          const isSuper = Boolean(localSuperusers[admin.id]);
          const currentPerms = localPermissions[admin.id] || [];
          const isCurrentSelf = admin.id === currentAuthUser?.id;
          const isSaving = savingAdminId === admin.id;

          return (
            <div
              key={admin.id}
              className={`bg-white rounded-3xl shadow-sm border transition-all p-6 md:p-8 ${
                isSuper ? "border-amber-200 bg-amber-50/10" : "border-gray-200"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-gray-900">{admin.email}</h2>
                    {isCurrentSelf && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                        You (Current Session)
                      </span>
                    )}
                    {isSuper ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase flex items-center gap-1 border border-amber-300">
                        <Crown size={14} /> Super Admin
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-black uppercase">
                        Restricted Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Username: <span className="font-bold text-gray-700">@{admin.username}</span> | Created: {admin.date_joined} | Last Login: {admin.last_login}
                  </p>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Presets:</span>
                  <button
                    onClick={() => applyPreset(admin.id, "SUPER_ADMIN")}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    👑 Super
                  </button>
                  <button
                    onClick={() => applyPreset(admin.id, "USER_ADMIN")}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    👥 Users
                  </button>
                  <button
                    onClick={() => applyPreset(admin.id, "PAYMENT_ADMIN")}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    💳 Payments
                  </button>
                  <button
                    onClick={() => applyPreset(admin.id, "SUPPORT_ADMIN")}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                  >
                    🎧 Support
                  </button>
                  <button
                    onClick={() => applyPreset(admin.id, "READ_ONLY")}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    👁️ Auditor
                  </button>
                  <button
                    onClick={() => applyPreset(admin.id, "CLEAR_ALL")}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    ❌ Clear
                  </button>
                </div>
              </div>

              {/* Super Admin Override Warning */}
              {isSuper && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 font-medium">
                  <Crown size={18} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Super Admin Status Active:</strong> This account automatically bypasses all permission checks and possesses full unrestricted access to all endpoints, modules, and data.
                  </span>
                </div>
              )}

              {/* Permissions Grid by Category */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat) => {
                  const catPerms = permissions.filter((p) => p.category === cat);

                  return (
                    <div key={cat} className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                        {getCategoryIcon(cat)}
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">{cat}</h4>
                      </div>

                      <div className="space-y-2.5">
                        {catPerms.map((perm) => {
                          const isChecked = isSuper || currentPerms.includes(perm.code);

                          return (
                            <label
                              key={perm.code}
                              className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-white shadow-xs border border-orange-200"
                                  : "hover:bg-white/80"
                              } ${isSuper ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isSuper}
                                onChange={() => handleTogglePermission(admin.id, perm.code)}
                                className="mt-0.5 h-4 w-4 rounded text-orange-500 focus:ring-orange-400 border-gray-300 cursor-pointer"
                              />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-gray-800 leading-tight">{perm.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{perm.code}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`super-toggle-${admin.id}`}
                    checked={isSuper}
                    onChange={() => handleToggleSuperuser(admin.id)}
                    className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor={`super-toggle-${admin.id}`} className="text-xs font-bold text-gray-700 cursor-pointer">
                    Grant Unrestricted Super Admin Privileges (is_superuser)
                  </label>
                </div>

                <button
                  onClick={() => handleSaveAdmin(admin.id)}
                  disabled={isSaving}
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2 shadow-sm text-white ${
                    isSuper ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
                  } ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving RBAC Scopes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Permissions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
