import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Search, 
  X, 
  User, 
  Globe, 
  Mail, 
  Calendar, 
  HardDrive, 
  CreditCard, 
  Clock, 
  Phone, 
  DollarSign,
  UserX,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Loader2
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]); // Stores all users from database.
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [packageFilter, setPackageFilter] = useState('All'); // All, Standard, Pro, Ultra
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => { // Fetches user data from backend API and handles loading/error states
    setApiError(null);
    try {
      const response = await api.get('/api/admin/users/');
      setUsers(response.data); // Save data
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setApiError(err.response?.data?.detail || "Failed to load users from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (user) => {
    if (!user) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    const isCurrentlyActive = user.is_active !== false;
    const targetAction = isCurrentlyActive ? 'suspend' : 'activate';

    try {
      const response = await api.post(`/api/admin/users/${user.id}/suspend/`, {
        action: targetAction,
      });

      const updatedIsActive = response.data.is_active;

      // Update in users array
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...u, is_active: updatedIsActive } : u))
      );

      // Update selectedUser state
      setSelectedUser((prev) =>
        prev && prev.id === user.id ? { ...prev, is_active: updatedIsActive } : prev
      );

      setActionSuccess(
        response.data.message ||
          (updatedIsActive ? 'Account reactivated successfully.' : 'Account suspended successfully.')
      );

      setTimeout(() => {
        setActionSuccess(null);
      }, 4000);
    } catch (err) {
      console.error("Failed to update user account status:", err);
      setActionError(err.response?.data?.detail || "Failed to change user status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => { // search and filter logic for user list
    const username = u.username || "";
    const email = u.email || "";
    const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage = packageFilter === 'All' || packageFilter === "Standard";

    return matchesSearch && matchesPackage;
  });

  // Show top 5 most recently created users by default; show all matches when searching
  const isSearching = searchTerm.trim().length > 0;
  const displayedUsers = isSearching ? filteredUsers : filteredUsers.slice(0, 5);

  const formatFileSize = (bytes) => {
    const b = parseFloat(bytes);
    if (isNaN(b) || b <= 0) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-10 bg-orange-500 rounded-md"></div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-600 font-medium">Monitor and manage system users</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <select 
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-6 py-3 bg-white rounded-2xl shadow-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer appearance-none border border-transparent"
          >
            <option value="All">All Packages</option>
            <option value="Standard">Standard</option>
            <option value="Pro">Pro</option>
            <option value="Ultra">Ultra</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Table info banner */}
        <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
          <span>
            {isSearching 
              ? `Search Results: ${displayedUsers.length} user(s) found` 
              : `Recent Users: Showing top ${displayedUsers.length} of ${users.length} total users`}
          </span>
          {!isSearching && users.length > 5 && (
            <span className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
              Type in search bar to find any user
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-black border-y border-gray-100">
                <th className="py-5 px-6">Username</th>
                <th className="py-5 px-6">Email</th>
                <th className="py-5 px-6">Created Date</th>
                <th className="py-5 px-6">Package</th>
                <th className="py-5 px-6">Country</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-center">Storage Usage (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="py-10 text-center text-gray-400">Loading system users...</td></tr>
              ) : apiError ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-red-500 font-bold">⚠️ {apiError}</span>
                      {apiError.toLowerCase().includes("token") || apiError.toLowerCase().includes("credential") ? (
                        <a href="/login" className="bg-orange-500 text-white px-4 py-1 rounded-lg text-xs font-bold">Please Login</a>
                      ) : (
                        <button onClick={fetchUsers} className="text-orange-500 text-xs underline font-bold">Try again</button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-gray-400">No users found.</td></tr>
              ) : displayedUsers.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => {
                    setSelectedUser(u);
                    setActionError(null);
                    setActionSuccess(null);
                  }}
                  className={`cursor-pointer transition-all group ${
                    u.is_active === false ? 'bg-red-50/20 hover:bg-red-50/50' : 'hover:bg-orange-50/50'
                  }`}
                >
                  <td className="py-5 px-6 font-black text-gray-800">@{u.username}</td>
                  <td className="py-5 px-6 font-medium text-gray-600">{u.email}</td>
                  <td className="py-5 px-6 text-gray-500">{u.date_joined}</td>
                  <td className="py-5 px-6">
                    <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase ${
                      u.package_name === 'Free' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {u.package_name || "Free"}
                    </span>
                  </td>
                  <td className="py-5 px-6 font-bold text-gray-700">{u.country || "N/A"}</td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider ${
                      u.is_active !== false 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {u.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-1 items-center">
                      <span className="font-black text-gray-800 text-[10px]">
                        {formatFileSize(u.storage_used_bytes)} ({(u.storage_usage_pct ?? 0).toFixed(u.storage_usage_pct > 0 && u.storage_usage_pct < 1 ? 2 : 1)}%)
                      </span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            u.is_active === false ? 'bg-gray-400' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(u.storage_usage_pct || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAILED PROFILE PANEL (Right Side Bar) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
          <div className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">User Detailed Profile</h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Avatar, Name & Status */}
              <div className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg ${
                  selectedUser.is_active !== false 
                    ? 'bg-orange-500 shadow-orange-200' 
                    : 'bg-red-500 shadow-red-200'
                }`}>
                  <User size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-800">{selectedUser.first_name || 'New'} {selectedUser.last_name || 'User'}</h3>
                <p className="text-orange-500 font-bold tracking-widest uppercase text-xs">@{selectedUser.username}</p>
                
                {/* Account Status Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedUser.is_active !== false
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${selectedUser.is_active !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {selectedUser.is_active !== false ? 'Active Account' : 'Account Suspended'}
                  </span>
                </div>
              </div>

              {/* Suspension Warning Notice */}
              {selectedUser.is_active === false && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs font-black text-red-800 uppercase tracking-wide">Account Suspended</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      This user cannot log in or perform actions on the web application. Their data and records remain safely stored in the database.
                    </p>
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-6">
                <DetailItem icon={<Mail size={18} />} label="Email Address" value={selectedUser.email} />
                <DetailItem 
                  icon={selectedUser.is_active !== false ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />} 
                  label="Account Status" 
                  value={selectedUser.is_active !== false ? "Active" : "Suspended"} 
                  badge={true}
                  isStatus={true}
                  statusActive={selectedUser.is_active !== false}
                />
                <DetailItem icon={<Phone size={18} />} label="Phone Number" value="Not Provided" />
                <DetailItem icon={<Globe size={18} />} label="Country" value={selectedUser.country || "N/A"} />
                <DetailItem icon={<Calendar size={18} />} label="Account Created" value={selectedUser.date_joined} />
                <DetailItem icon={<CreditCard size={18} />} label="Current Package" value={selectedUser.package_name || "Free"} badge />
                <DetailItem icon={<DollarSign size={18} />} label="Payment Amount" value={selectedUser.package_name === 'Free' ? 'Rs. 0.00' : 'Subscription Active'} />
                <DetailItem icon={<HardDrive size={18} />} label="Storage Used" value={`${formatFileSize(selectedUser.storage_used_bytes)} of ${selectedUser.total_storage_gb || 5}GB (${selectedUser.storage_usage_pct}%)`} />
                <DetailItem icon={<Clock size={18} />} label="Last Login" value={selectedUser.last_login} />
              </div>

              {/* Upgrade History */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Upgrade History</h4>
                <p className="text-xs text-gray-400 italic">No upgrade history found for this user.</p>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
              {actionError && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
                  ⚠️ {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                  ✅ {actionSuccess}
                </div>
              )}
              <button 
                onClick={() => handleToggleSuspend(selectedUser)}
                disabled={actionLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                  selectedUser.is_active !== false 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                } ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Updating Status...</span>
                  </>
                ) : selectedUser.is_active !== false ? (
                  <>
                    <UserX size={18} />
                    <span>Suspend Account</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>Reactivate Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for Detail Panel items
const DetailItem = ({ icon, label, value, badge, isStatus, statusActive }) => {
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
  return (
    <div className="flex gap-4 items-start group">
      <div className={`p-2.5 rounded-xl transition-colors ${
        isStatus 
          ? statusActive 
            ? 'bg-emerald-50 text-emerald-600' 
            : 'bg-red-50 text-red-600'
          : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        {isStatus ? (
          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
            statusActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {displayValue}
          </span>
        ) : badge ? (
          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
            value === 'Free' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'
          }`}>
            {displayValue}
          </span>
        ) : (
          <p className="font-bold text-gray-800 break-all">{displayValue}</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;