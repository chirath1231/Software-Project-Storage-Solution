import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Users, Award, Loader2 } from 'lucide-react';
import api from '../api/axios';

const AdminSubscriptionAnalytics = () => {
  const [data, setData] = useState(null); //stores API response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 //fetch data
  useEffect(() => {
    //Creates asynchronous function.
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/subscriptions/analytics/');
        setData(response.data); //aves API response into React state
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false); //Stop loading
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Fetching Database Statistics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-red-500 font-bold">{error}</div>;
  }

  const packageStats = data.package_overview;
  const topUsers = data.top_users;
  
  // Calculate total revenue from current data
  const totalRevenue = data.revenue_distribution.reduce((acc, curr) => acc + curr.value, 0); //sums up revenue from all packages to get total revenue
  const activeSubscribers = data.popularity.web; //gets number of web users

  // Pie Chart Logic (Colors for the segments)
  const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#6366f1'];
  let cumulativePct = 0;
  const pieGradientParts = data.revenue_distribution.map((item, index) => { //calculates the percentage of total revenue for each package to determine size of pie segment; (item.value / totalRevenue) * 100
    const pct = totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;
    const start = cumulativePct;
    cumulativePct += pct;
    return `${colors[index % colors.length]} ${start}% ${cumulativePct}%`;
  });

  const pieGradient = `conic-gradient(${pieGradientParts.join(', ')})`;

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
              <h3 className="text-3xl font-black text-gray-800 mt-1">LKR {totalRevenue.toLocaleString()}</h3>
            </div>
            <DollarSign className="text-orange-500 mt-2" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Subscribers</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1">{activeSubscribers}</h3>
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
              {packageStats.map((pkg) => ( //Iterates over package statistics from API response to create a table row for each package, displaying its name, user counts, revenue, and growth percentage
                <tr key={pkg.subscription__id} className="hover:bg-orange-50/50 transition-all group">
                  <td className="py-6 px-6 font-black text-gray-800 text-lg">{pkg.subscription__name}</td>
                  <td className="py-6 px-6 font-bold text-gray-600">{pkg.user_count}</td>
                  <td className="py-6 px-6 font-bold text-gray-600">0</td>
                  <td className="py-6 px-6 font-black text-gray-900">{pkg.user_count}</td>
                  <td className="py-6 px-6 font-black text-orange-600 tracking-tighter text-xl">LKR {pkg.total_revenue}</td>
                  <td className="py-6 px-6">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase w-fit bg-gray-100 text-gray-400`}>
                      New
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
               <div key={pkg.subscription__id} className="flex flex-col items-center gap-2 w-1/4">
                 <div className="flex gap-1 items-end h-48 w-full justify-center">
                   <div 
                   //Converts users into percentage height.
                    style={{ height: `${activeSubscribers > 0 ? (pkg.user_count / activeSubscribers) * 100 : 0}%` }} 
                    className="w-4 bg-orange-500 rounded-t-sm hover:opacity-80 transition-all cursor-help relative group"
                   >
                     <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Web: {pkg.user_count}</span>
                   </div>
                   <div 
                    style={{ height: `0%` }} 
                    className="w-4 bg-blue-500 rounded-t-sm hover:opacity-80 transition-all cursor-help relative group"
                   >
                     <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Mob: 0</span>
                   </div>
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate w-full text-center">{pkg.subscription__name}</span>
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
              {data.revenue_distribution.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <span className="text-sm font-bold text-gray-500 uppercase">{item.name}</span>
                  </div>
                  <span className="font-black text-gray-800">
                    {totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOP PAYING USERS TABLE */}
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
              {topUsers.map((user, idx) => (  //displays highest paying users based on API response, showing their email, package, and total amount spent
                <tr key={idx} className="hover:bg-orange-50/50 transition-all group">
                  <td className="py-5 px-6 font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-black group-hover:bg-orange-500 group-hover:text-white transition-all">{user.user_email[0].toUpperCase()}</div>
                    {user.user_email}
                  </td>
                  <td className="py-5 px-6">
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Customer
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right font-black text-gray-900 text-lg">LKR {user.total_spent}</td>
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