import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Users, Award } from 'lucide-react';

const AdminSubscriptionAnalytics = () => {
  // Hardcoded Data for Frontend Development
  const packageStats = [
    { name: 'Standard', web: 450, mobile: 320, total: 770, revenue: 3850, growth: 10, color: '#f97316' },
    { name: 'Pro', web: 300, mobile: 280, total: 580, revenue: 8700, growth: 5, color: '#3b82f6' },
    { name: 'Ultra', web: 120, mobile: 90, total: 210, revenue: 6300, growth: -5, color: '#8b5cf6' },
  ];

  const topUsers = [
    { username: 'mehrabbozorgi', package: 'Ultra', spent: 1250, initial: 'M' },
    { username: 'janesmith', package: 'Pro', spent: 980, initial: 'J' },
    { username: 'johndoe', package: 'Ultra', spent: 840, initial: 'J' },
    { username: 'alicejohnson', package: 'Standard', spent: 450, initial: 'A' },
  ];

  // Total revenue for percentage calculation in Pie Chart
  const totalRevenue = 18850;

  // Percentage Calculations for Custom Pie
  const standardPct = Math.round((3850 / totalRevenue) * 100);
  const proPct = Math.round((8700 / totalRevenue) * 100);
  const ultraPct = Math.round((6300 / totalRevenue) * 100);

  // Conic gradient for the CSS Pie Chart
  const pieGradient = `conic-gradient(#f97316 0% ${standardPct}%, #3b82f6 ${standardPct}% ${standardPct + proPct}%, #8b5cf6 ${standardPct + proPct}% 100%)`;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-10 bg-orange-500 rounded-md"></div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Subscription Analytics</h1>
          <p className="text-gray-600 font-medium">Real-time business performance & user trends</p>
        </div>
      </div>

      {/* STAT CARDS: Highlighting Upgrades/Downgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Upgrades This Week</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1">24</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> +12% from last week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Downgrades</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1">7</h3>
            </div>
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
            <ArrowDownRight size={14} /> -2% from last week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1">${totalRevenue.toLocaleString()}</h3>
            </div>
            <DollarSign className="text-orange-500 mt-2" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Subscribers</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1">1,560</h3>
            </div>
            <Users className="text-blue-500 mt-2" size={32} />
          </div>
        </div>
      </div>

      {/* PACKAGE OVERVIEW TABLE */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Award size={24} className="text-orange-500" /> Package Overview Table
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-black border-y border-gray-200">
                <th className="py-5 px-6">Package Name</th>
                <th className="py-5 px-6">Web Users</th>
                <th className="py-5 px-6">Mobile Users</th>
                <th className="py-5 px-6">Total Users</th>
                <th className="py-5 px-6">Revenue</th>
                <th className="py-5 px-6">Growth (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packageStats.map((pkg) => (
                <tr key={pkg.name} className="hover:bg-orange-50/50 transition-all group">
                  <td className="py-6 px-6 font-black text-gray-800 text-lg">{pkg.name}</td>
                  <td className="py-6 px-6 font-bold text-gray-600">{pkg.web}</td>
                  <td className="py-6 px-6 font-bold text-gray-600">{pkg.mobile}</td>
                  <td className="py-6 px-6 font-black text-gray-900">{pkg.total}</td>
                  <td className="py-6 px-6 font-black text-orange-600 tracking-tighter text-xl">${pkg.revenue}</td>
                  <td className="py-6 px-6">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase w-fit ${pkg.growth > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {pkg.growth > 0 ? `🔼 +${pkg.growth}%` : `🔽 ${pkg.growth}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Popularity Bar Chart */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-tighter">Web vs Mobile Popularity</h2>
          <div className="flex items-end justify-around h-64 border-b border-l border-gray-100 px-4 pt-10 relative">
             {packageStats.map(pkg => (
               <div key={pkg.name} className="flex flex-col items-center gap-2 w-1/4">
                 <div className="flex gap-1 items-end h-48 w-full justify-center">
                   <div 
                    style={{ height: `${(pkg.web / 500) * 100}%` }} 
                    className="w-4 bg-orange-500 rounded-t-sm hover:opacity-80 transition-all cursor-help relative group"
                   >
                     <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Web:{pkg.web}</span>
                   </div>
                   <div 
                    style={{ height: `${(pkg.mobile / 500) * 100}%` }} 
                    className="w-4 bg-blue-500 rounded-t-sm hover:opacity-80 transition-all cursor-help relative group"
                   >
                     <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Mob:{pkg.mobile}</span>
                   </div>
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{pkg.name}</span>
               </div>
             ))}
             <div className="absolute bottom-[-30px] right-0 flex gap-4 text-[10px] font-bold">
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Web</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Mobile</div>
             </div>
          </div>
        </div>

        {/* Revenue Distribution Chart (Bulletproof CSS Pie) */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-black text-gray-800 mb-8 uppercase tracking-tighter">Revenue Distribution</h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-48 h-48 rounded-full flex-shrink-0 shadow-xl" style={{ background: pieGradient }}>
              <div className="absolute inset-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                <span className="text-xl font-black text-gray-800">100%</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-4">
               <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                   <span className="text-sm font-bold text-gray-500 uppercase">Standard</span>
                 </div>
                 <span className="font-black text-gray-800">{standardPct}%</span>
               </div>
               <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                   <span className="text-sm font-bold text-gray-500 uppercase">Pro</span>
                 </div>
                 <span className="font-black text-gray-800">{proPct}%</span>
               </div>
               <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                   <span className="text-sm font-bold text-gray-500 uppercase">Ultra</span>
                 </div>
                 <span className="font-black text-gray-800">{ultraPct}%</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP PAYING USERS TABLE (Bulletproof Version) */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Users size={24} className="text-orange-500" /> Top Paying Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-black border-y border-gray-200">
                <th className="py-5 px-6">Username</th>
                <th className="py-5 px-6">Package</th>
                <th className="py-5 px-6 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-orange-50/50 transition-all group">
                  <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-black group-hover:bg-orange-500 group-hover:text-white transition-all">{user.initial}</div>
                    @{user.username}
                  </td>
                  <td className="py-5 px-6">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                      {user.package}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right font-black text-gray-900 text-lg">${user.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionAnalytics;