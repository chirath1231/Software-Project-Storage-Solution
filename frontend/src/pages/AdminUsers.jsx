import React, { useState } from 'react';
import { Search, Filter, X, User, Globe, Mail, Calendar, HardDrive, CreditCard, Clock, Phone, DollarSign, ChevronDown } from 'lucide-react';

const AdminUsers = () => {
  // Hardcoded Mock Data
  const [users] = useState([
    { 
      id: 1, firstName: 'Rashmi', lastName: 'Perera', username: 'rashmi23', email: 'rashmi@gmail.com', 
      createdDate: '2026-01-02', package: 'Ultra', country: 'Sri Lanka', usage: 65, status: 'Online',
      phone: '+94 77 123 4567', lastLogin: '10 mins ago', payment: 120.00, platform: 'Web',
      history: ['Upgraded to Premium (2026-01-02)', 'Joined (2025-12-15)']
    },
    { 
      id: 2, firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com', 
      createdDate: '2025-11-20', package: 'Standard', country: 'USA', usage: 30, status: 'Offline',
      phone: '+1 555 0199', lastLogin: '2 days ago', payment: 45.00, platform: 'Mobile',
      history: ['Joined (2025-11-20)']
    },
    { 
      id: 3, firstName: 'Jane', lastName: 'Smith', username: 'jsmith', email: 'jane@service.com', 
      createdDate: '2025-05-10', package: 'Pro', country: 'UK', usage: 88, status: 'Online',
      phone: '+44 20 7946 0958', lastLogin: 'Just now', payment: 85.00, platform: 'Web',
      history: ['Upgraded to Pro (2025-08-01)', 'Joined (2025-05-10)']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Web, Mobile, Active
  const [packageFilter, setPackageFilter] = useState('All'); // All, Standard, Pro, Ultra
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'Web') matchesType = u.platform === 'Web';
    if (filterType === 'Mobile') matchesType = u.platform === 'Mobile';
    if (filterType === 'Active') matchesType = u.status === 'Online';

    const matchesPackage = packageFilter === 'All' || u.package === packageFilter;

    return matchesSearch && matchesType && matchesPackage;
  });

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
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm font-bold text-gray-600 hover:bg-gray-50 transition-all border border-transparent active:scale-95"
            >
              <Filter size={18} className={filterType !== 'All' ? 'text-orange-500' : ''} />
              {filterType === 'All' ? 'Filter Users' : `${filterType} Users`}
              <ChevronDown size={16} />
            </button>
            
            {showFilters && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20">
                {['All', 'Web', 'Mobile', 'Active'].map(type => (
                  <button
                    key={type}
                    onClick={() => { setFilterType(type); setShowFilters(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filterType === type ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {type === 'All' ? 'All Users' : type === 'Active' ? 'Active Users' : `${type} Users`}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                <th className="py-5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-orange-50/50 cursor-pointer transition-all group"
                >
                  <td className="py-5 px-6 font-black text-gray-800">@{u.username}</td>
                  <td className="py-5 px-6 font-medium text-gray-600">{u.email}</td>
                  <td className="py-5 px-6 text-gray-500">{u.createdDate}</td>
                  <td className="py-5 px-6">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg font-black text-[10px] uppercase">
                      {u.package}
                    </span>
                  </td>
                  <td className="py-5 px-6 font-bold text-gray-700">{u.country}</td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-1 items-center">
                      <span className="font-black text-gray-800">{u.usage}%</span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${u.usage > 80 ? 'bg-red-500' : 'bg-orange-500'}`} 
                          style={{ width: `${u.usage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${u.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
                      <span className={`font-bold ${u.status === 'Online' ? 'text-green-600' : 'text-gray-400'}`}>{u.status}</span>
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
                <h3 className="text-2xl font-black text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p className="text-orange-500 font-bold tracking-widest uppercase text-xs">@{selectedUser.username}</p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-6">
                <DetailItem icon={<Mail size={18} />} label="Email Address" value={selectedUser.email} />
                <DetailItem icon={<Phone size={18} />} label="Phone Number" value={selectedUser.phone} />
                <DetailItem icon={<Globe size={18} />} label="Country" value={selectedUser.country} />
                <DetailItem icon={<Calendar size={18} />} label="Account Created" value={selectedUser.createdDate} />
                <DetailItem icon={<CreditCard size={18} />} label="Current Package" value={selectedUser.package} badge />
                <DetailItem icon={<DollarSign size={18} />} label="Payment Amount" value={`$${selectedUser.payment.toFixed(2)}`} />
                <DetailItem icon={<HardDrive size={18} />} label="Storage Used" value={`${selectedUser.usage}% of limit`} />
                <DetailItem icon={<Clock size={18} />} label="Last Login" value={selectedUser.lastLogin} />
              </div>

              {/* Upgrade History */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Upgrade History</h4>
                <div className="space-y-3">
                  {selectedUser.history.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium text-gray-600 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
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
const DetailItem = ({ icon, label, value, badge }) => (
  <div className="flex gap-4 items-start group">
    <div className="p-2.5 bg-gray-100 text-gray-400 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      {badge ? (
        <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">
          {value}
        </span>
      ) : (
        <p className="font-bold text-gray-800 break-all">{value}</p>
      )}
    </div>
  </div>
);

export default AdminUsers;