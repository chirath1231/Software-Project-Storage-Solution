import React from "react";
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  Wallet, 
  HardDrive, 
  Zap,
  BarChart3,
  TrendingUp,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  // Hardcoded Mock Data
  const stats = [
    { label: "Total Users", value: "1,245", icon: <Users size={24} />, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
    { label: "Today's New Users", value: "12", icon: <UserPlus size={24} />, color: "text-orange-600", bg: "bg-orange-50", trend: "+2" },
    { label: "Total Income", value: "$18,850", icon: <DollarSign size={24} />, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+8.5%" },
    { label: "Today's Income", value: "$450", icon: <Wallet size={24} />, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+$120" },
    { label: "Total Storage Used", value: "4.2 TB", icon: <HardDrive size={24} />, color: "text-rose-600", bg: "bg-rose-50", trend: "65% of Limit" },
    { label: "Active Users (Online)", value: "34", icon: <Zap size={24} />, color: "text-amber-500", bg: "bg-amber-50", trend: "High Activity" },
  ];

  const weeklyUsers = [40, 65, 45, 90, 75, 85, 60]; // height percentages
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-2 h-10 bg-orange-500 rounded-md"></div>
        <div id="debug-check-dashboard"> {/* Added ID for easy inspection */}
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">System <span className="text-orange-500">Overview</span></h1>
          <p className="text-gray-500 font-medium">Real-time monitoring and business performance analytics.</p>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-800 tracking-tighter">{stat.value}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black px-2 py-1 bg-gray-100 text-gray-500 rounded-lg uppercase">
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly New Users Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-orange-500" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Weekly New Users</h2>
            </div>
            <span className="text-xs font-bold text-gray-400">Past 7 Days</span>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyUsers.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div 
                  style={{ height: `${h}%` }} 
                  className="w-full bg-orange-500 rounded-t-xl hover:bg-orange-600 transition-all cursor-pointer group relative shadow-lg shadow-orange-100"
                >
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(h/4)} Users
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Income Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Weekly Income</h2>
            </div>
            <span className="text-emerald-500 text-xs font-black">+$2,450.00 This Week</span>
          </div>
          <div className="space-y-6">
            {[75, 45, 92, 60].map((val, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-gray-500 uppercase tracking-widest">
                  <span>Week {i+1}</span>
                  <span className="text-gray-800">${val * 12}</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                  <div 
                    style={{ width: `${val}%` }} 
                    className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Storage Usage Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Weekly Storage Utilization</h2>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Used Space
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-6">
            {[60, 62, 65, 68, 72, 75, 78].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col gap-4">
                <div className="w-full bg-gray-100 rounded-2xl h-full relative overflow-hidden flex flex-col justify-end border border-gray-100">
                  <div style={{ height: `${val}%` }} className="bg-blue-500 w-full hover:bg-blue-600 transition-all cursor-help"></div>
                </div>
                <span className="text-center text-[10px] font-black text-gray-400 uppercase">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}