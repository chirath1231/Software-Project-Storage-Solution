import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Users,
  UserPlus,
  DollarSign,
  Wallet,
  HardDrive,
  BarChart3,
  TrendingUp,
  Activity,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null); // State to hold dashboard data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track any errors during data fetching

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // API GET request to backend
        // Retrieves subscription report data
        const response = await api.get('/api/subscriptions/reports/');
        // Save received data into state
        setData(response.data);
      } catch (err) {
        // Error handling
        console.error("Dashboard fetch error:", err);
        setError("Failed to sync system overview.");
      } finally {
        // Stop loading regardless of success/failure
        setLoading(false);
      }
    };
    // Call function
    fetchDashboardData();
  }, []);

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing System Core...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-red-500 font-bold">{error}</div>;
  }

  // Extracting data for easier mapping
  const {
    total_users,
    total_income,
    weekly_new_users,
    weekly_income,
    labels,
    weekly_storage,
    comparison
  } = data;

  // Get latest new users value
  // length - 1 gets last array element
  const todayNewUsers = weekly_new_users[weekly_new_users.length - 1];
  const todayIncome = weekly_income[weekly_income.length - 1];
  const currentStorage = weekly_storage[weekly_storage.length - 1];

  // Each object represents one card in the dashboard.
  const stats = [
    {
      label: "Total Users",
      value: total_users.toLocaleString(),
      icon: <Users size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: `+${comparison.users.current} this week`
    },
    {
      label: "Today's New Users",
      value: todayNewUsers,
      icon: <UserPlus size={24} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: "Recent"
    },
    {
      label: "Total Income",
      value: `Rs. ${total_income.toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "All Time"
    },
    {
      label: "Today's Income",
      value: `Rs. ${todayIncome.toLocaleString()}`,
      icon: <Wallet size={24} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: "Settled"
    },
    {
      label: "Current Storage",
      value: `${currentStorage} GB`,
      icon: <HardDrive size={24} />,
      color: "text-rose-600",
      bg: "bg-rose-50",
      trend: `${comparison.storage.diff >= 0 ? '+' : ''}${comparison.storage.diff}GB vs last`
    },
  ];

  // Math.max is used to find highest value in array
  // This helps scale graphs properly
  const maxWeeklyUsers = Math.max(...weekly_new_users) || 1;
  const maxWeeklyIncome = Math.max(...weekly_income) || 1;
  const maxWeeklyStorage = Math.max(...weekly_storage) || 1;

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
        {/*<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-orange-500" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Weekly New Users</h2>
            </div>
            <span className="text-xs font-bold text-gray-400">Past 7 Days</span>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {weekly_new_users.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div
                  style={{ height: `${(val / maxWeeklyUsers) * 100}%` }}
                  className="w-full bg-orange-500 rounded-t-xl hover:bg-orange-600 transition-all cursor-pointer group relative shadow-lg shadow-orange-100"
                >
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val} Users
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>*/}

        {/* Weekly Income Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Weekly Income</h2>
            </div>
            <span className="text-emerald-500 text-xs font-black">+Rs. {comparison.income.current.toLocaleString()} This Week</span>
          </div>
          <div className="space-y-6">
            {weekly_income.map((val, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-gray-500 uppercase tracking-widest">
                  <span>{labels[i]}</span>
                  <span className="text-gray-800">Rs. {val.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                  <div
                    style={{ width: `${(val / maxWeeklyIncome) * 100}%` }}
                    className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Storage Usage Chart (Line Chart) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Weekly Storage Utilization</h2>
            </div>
            {/* Legend for Used Space */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Used Space
              </div>
            </div>
          </div>
          <div className="relative h-40 w-full px-4"> {/* Adjusted height and padding for the chart */}
            <svg viewBox="0 0 1000 100" className="w-full h-full overflow-visible">
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map((y, idx) => (
                <line key={`h-line-${idx}`} x1="0" y1={y} x2="1000" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
              ))}
              {/* Vertical grid lines for each day */}
              {labels.map((_, i) => (
                <line key={`v-line-${i}`} x1={(i * 1000) / (labels.length - 1 || 1)} y1="0" x2={(i * 1000) / (labels.length - 1 || 1)} y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
              ))}

              {/* The Line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={weekly_storage.map((val, i) => {
                  const x = (i * 1000) / (labels.length - 1 || 1);
                  const y = 100 - (val / maxWeeklyStorage) * 100; // Invert Y-axis for SVG
                  return `${x},${y}`;
                }).join(' ')}
                className="transition-all duration-500"
              />

              {/* Data Points with Tooltips */}
              {weekly_storage.map((val, i) => {
                const x = (i * 1000) / (labels.length - 1 || 1);
                const y = 100 - (val / maxWeeklyStorage) * 100;
                return (
                  <g key={`point-${i}`} className="group">
                    <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" className="transition-all duration-200 group-hover:r-6 group-hover:fill-orange-500" />
                    <text
                      x={x}
                      y={y - 10} // Position above the circle
                      textAnchor="middle"
                      className="fill-gray-800 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {val.toFixed(2)} GB
                    </text>
                  </g>
                );
              })}
            </svg>
            {/* Labels below the chart */}
            <div className="flex justify-between mt-2 px-2">
              {labels.map((label, i) => (
                <span key={i} className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
