import React, { useState } from 'react';
import { FileText, Download, TrendingUp, TrendingDown, Monitor, Smartphone, Calendar, Info } from 'lucide-react';

export default function AdminReports() {
  // Hardcoded Weekly Data (Mon-Sun)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyNewUsers = [30, 45, 35, 55, 60, 50, 35]; // Total: 310
  const weeklyIncome = [600, 750, 680, 890, 1100, 700, 490]; // Total: 5210
  const weeklyStorage = [40, 42, 45, 48, 55, 60, 62]; // in GB

  // Comparison Data
  const comparison = {
    users: { current: 310, last: 230, diff: 80, weekLabel: 'Week 11' },
    income: { current: 5210, last: 4800, diff: 410, weekLabel: 'Week 11' },
    storage: { current: 62, last: 58, diff: 4 },
  };

  // Yearly Data for Line Chart
  const yearlyData = [
    { month: 'Jan', web: 400, mobile: 200, income: 12000 },
    { month: 'Feb', web: 450, mobile: 250, income: 13500 },
    { month: 'Mar', web: 520, mobile: 310, income: 15000 },
    { month: 'Apr', web: 480, mobile: 400, income: 14200 },
    { month: 'May', web: 600, mobile: 450, income: 18000 },
    { month: 'Jun', web: 750, mobile: 520, income: 21000 },
    { month: 'Jul', web: 820, mobile: 600, income: 24000 },
    { month: 'Aug', web: 800, mobile: 680, income: 23500 },
    { month: 'Sep', web: 900, mobile: 720, income: 26000 },
    { month: 'Oct', web: 950, mobile: 800, income: 28000 },
    { month: 'Nov', web: 1100, mobile: 950, income: 32000 },
    { month: 'Dec', web: 1245, mobile: 1100, income: 35000 },
  ];

  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Helper for Weekly Bar Charts
  const WeeklyBarChart = ({ title, data, unit, colorClass, shadowClass }) => {
    const maxVal = Math.max(...data);
    return (
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex-1 transition-hover hover:shadow-md">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{title}</h3>
        <div className="flex items-end justify-between h-36 gap-2">
          {data.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div
                style={{ height: `${(val / maxVal) * 100}%` }}
                className={`w-full ${colorClass} rounded-t-lg transition-all group-hover:opacity-80 relative cursor-help ${shadowClass}`}
              >
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 shadow-xl transition-all">
                  {unit === '$' ? '$' : ''}
                  {val.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-orange-500 rounded-md" id="debug-check-reports"></div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
              Reports & <span className="text-orange-500">Analytics</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">System intelligence center</p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 shadow-2xl shadow-gray-200">
          <Download size={16} />
          Export Full Report (PDF)
        </button>
      </div>

      {/* Section 1: Weekly Breakdown */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-orange-500" size={20} />
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Weekly Performance Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <ComparisonCard
            label={`${comparison.users.weekLabel} Users`}
            current={comparison.users.current}
            last={comparison.users.last}
            diff={comparison.users.diff}
            unit="Users"
          />
          <ComparisonCard
            label={`${comparison.income.weekLabel} Income`}
            current={comparison.income.current}
            last={comparison.income.last}
            diff={comparison.income.diff}
            unit="$"
          />
          <ComparisonCard
            label="Week 11 Storage"
            current={comparison.storage.current}
            last={comparison.storage.last}
            diff={comparison.storage.diff}
            unit="GB"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <WeeklyBarChart title="New Users This Week" data={weeklyNewUsers} unit="" colorClass="bg-orange-500" shadowClass="shadow-orange-200 shadow-lg" />
          <WeeklyBarChart title="Daily Income ($)" data={weeklyIncome} unit="$" colorClass="bg-emerald-500" shadowClass="shadow-emerald-200 shadow-lg" />
          <WeeklyBarChart title="Storage Utilization (GB)" data={weeklyStorage} unit="" colorClass="bg-blue-500" shadowClass="shadow-blue-200 shadow-lg" />
        </div>
      </div>

      {/* Section 2: Yearly Analytics */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-14">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">Yearly User Trends</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">Cross-platform growth analysis</p>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Web Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-md"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Native</span>
            </div>
          </div>
        </div>

        {/* Line Chart Visualization */}
        <div className="relative h-72 w-full px-4 mb-8">
          <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={yearlyData.map((d, i) => `${(i * 1000) / 11},${200 - (d.web / 1300) * 200}`).join(' ')}
              className="drop-shadow-xl transition-all duration-700"
            />
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={yearlyData.map((d, i) => `${(i * 1000) / 11},${200 - (d.mobile / 1300) * 200}`).join(' ')}
              className="drop-shadow-xl transition-all duration-700"
            />
            {yearlyData.map((d, i) => (
              <rect
                key={i}
                x={(i * 1000) / 11 - 20}
                y="0"
                width="40"
                height="200"
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredMonth(d)}
                onMouseLeave={() => setHoveredMonth(null)}
              />
            ))}
          </svg>

          <div className="flex justify-between mt-6 px-2">
            {yearlyData.map((d, i) => (
              <span key={i} className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                {d.month}
              </span>
            ))}
          </div>

          {hoveredMonth && (
            <div className="absolute top-0 right-0 md:right-8 bg-gray-900 text-white p-6 rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-200 z-20 min-w-[240px] border border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <span className="font-black text-orange-500 uppercase tracking-[0.2em] text-[10px]">
                  {hoveredMonth.month} Analytics
                </span>
                <Info size={12} className="text-gray-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Monitor size={12} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Web</span>
                  </div>
                  <span className="font-black text-xs">{hoveredMonth.web.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Smartphone size={12} className="text-orange-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Mobile</span>
                  </div>
                  <span className="font-black text-xs">{hoveredMonth.mobile.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Income</span>
                  <span className="font-black text-emerald-400 text-sm">${hoveredMonth.income.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ComparisonCard = ({ label, current, last, diff, unit }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">{label}</p>
    <div className="flex items-baseline gap-2 mb-2">
      <h4 className="text-4xl font-black text-gray-800 tracking-tighter">
        {unit === '$' && '$'}
        {current.toLocaleString()}
        {unit !== '$' && unit !== 'Users' && ` ${unit}`}
      </h4>
    </div>
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${
          diff >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}
      >
        {diff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {diff >= 0 ? `+${diff}` : diff} {unit}
      </div>
      <span className="text-[10px] font-black text-gray-300 uppercase">vs last week</span>
    </div>
  </div>
);