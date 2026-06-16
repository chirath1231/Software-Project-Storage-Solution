import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, X, User, Globe, Mail, Calendar, HardDrive, CreditCard, Clock, Phone, DollarSign } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]); //Stores all users from database.
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [packageFilter, setPackageFilter] = useState('All'); // All, Standard, Pro, Ultra
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => { //Fetches user data from backend API and handles loading/error states; also ensures any previous errors are cleared before new request
    setApiError(null);
    try {
      const response = await api.get('/api/admin/users/');
      setUsers(response.data); //Save data
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setApiError(err.response?.data?.detail || "Failed to load users from server.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => { //search and filter logic for user list; checks if username or email contains search term, and if user's package matches selected filter (currently all users treated as 'Standard' since real package data isn't in DB yet)
    // Safe string checks to prevent crashes on null/undefined values
    const username = u.username || "";
    const email = u.email || "";
    const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase()); // Checks if search term is in username or email (case-insensitive)
    
    // Since real packages aren't in the DB yet, we treat everyone as 'Standard' for now
    const matchesPackage = packageFilter === 'All' || packageFilter === "Standard"; //currently dummy filter; in future, would check u.package_name against packageFilter

    return matchesSearch && matchesPackage;
  });

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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-black border-y border-gray-100">
                <th className="py-5 px-6">Username</th>
                <th className="py-5 px-6">Email</th>
                <th className="py-5 px-6">Created Date</th>
                <th className="py-5 px-6">Package</th>
                <th className="py-5 px-6">Country</th>
                <th className="py-5 px-6 text-center">Storage Usage (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400">Loading system users...</td></tr>
              ) : apiError ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center">
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
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400">No users found.</td></tr>
              ) : filteredUsers.map((u) => ( //loops through users and displays table rows
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-orange-50/50 cursor-pointer transition-all group"
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
                    <div className="flex flex-col gap-1 items-center">
                      <span className="font-black text-gray-800 text-[10px]">
                        {formatFileSize(u.storage_used_bytes)} ({(u.storage_usage_pct ?? 0).toFixed(u.storage_usage_pct > 0 && u.storage_usage_pct < 1 ? 2 : 1)}%)
                      </span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-orange-500 transition-all duration-500" 
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
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-orange-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
                  <User size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-800">{selectedUser.first_name || 'New'} {selectedUser.last_name || 'User'}</h3>
                <p className="text-orange-500 font-bold tracking-widest uppercase text-xs">@{selectedUser.username}</p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-6">
                <DetailItem icon={<Mail size={18} />} label="Email Address" value={selectedUser.email} />
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
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
              <button className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95">
                Email User
              </button>
              <button className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all active:scale-95">
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for Detail Panel items
const DetailItem = ({ icon, label, value, badge }) => {
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value; // Ensure value is not null or undefined before calling toFixed
  return (
    <div className="flex gap-4 items-start group">
    <div className="p-2.5 bg-gray-100 text-gray-400 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      {badge ? (
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