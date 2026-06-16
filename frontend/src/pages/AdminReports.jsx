import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Monitor, Smartphone, Calendar, Info, Loader2 } from 'lucide-react';
import api from '../api/axios';

// Helper for Weekly Bar Charts - Moved outside to prevent re-mounting
// const WeeklyBarChart = ({ title, data, unit, colorClass, shadowClass, maxVal, chartLabels }) => {
//   return (
//     <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex-1 transition-hover hover:shadow-md">
//       <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{title}</h3>
//       <div className="flex items-end justify-between h-40 gap-2">
//         {chartLabels.map((day, i) => {
//           const val = data[i] || 0;
//           const barHeight = maxVal > 0 ? (val / maxVal) * 100 : 0;
//           return (
//             <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
//               <div
//                 style={{ height: `${barHeight}%` }}
//                 className={`w-full ${colorClass} rounded-t-lg transition-all group-hover:opacity-80 relative cursor-help ${shadowClass} min-h-[2px]`}
//               >
//                 <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-100 whitespace-nowrap z-10 shadow-xl transition-all">
//                   {unit === 'Rs.' ? 'Rs. ' : ''}
//                   {val.toLocaleString()}
//                 </span>
//               </div>
//               <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// Helper for Weekly Bar Charts - UPDATED VERSION
const WeeklyBarChart = ({
  title,
  data,
  unit,
  colorClass,
  shadowClass,
  maxVal,
  chartLabels
}) => {
  // Create visible scale values
  const scaleSteps = 5; //Chart divided into 5 sections.

  //Creates the Y-axis numbers dynamically.
  const yAxisValues = Array.from(
    { length: scaleSteps + 1 },
    (_, i) =>
      Math.round((maxVal / scaleSteps) * (scaleSteps - i))
  );

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex-1 transition-hover hover:shadow-md">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
        {title}
      </h3>

      
      <div className="flex h-56">
        {/* Y AXIS */}
        <div className="flex flex-col justify-between pr-3 text-[10px] font-bold text-gray-400 min-w-[30px]">
          {yAxisValues.map((val, idx) => (
            <span key={idx}>
              {unit === "Rs."
                ? Math.round(val).toLocaleString()
                : val}
            </span>
          ))}
        </div>

        {/* GRAPH AREA */}
        <div className="relative flex-1 border-l border-b border-gray-200">
          {/* GRID LINES */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: scaleSteps + 1 }).map((_, idx) => (
              <div
                key={idx}
                className="border-t border-dashed border-gray-200 w-full"
              />
            ))}
          </div>

          {/* BARS */}
          <div className="relative z-10 flex items-end justify-between h-full gap-2 px-2">
            {chartLabels.map((day, i) => {
              const val = data[i] || 0;

              // Keep small values visible
              const barHeight =
                val > 0
                  ? Math.max((val / maxVal) * 100, 12)
                  : 0;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full group"
                >
                  {/* VALUE LABEL */}
                  <span className="text-[10px] font-black text-gray-700 mb-2">
                    {unit === "Rs." ? "Rs. " : ""}
                    {val.toLocaleString()}
                  </span>

                  {/* BAR */}
                  <div
                    style={{
                      height: `${barHeight}%`,
                    }}
                    className={`w-full rounded-t-xl transition-all duration-300 hover:opacity-80 ${colorClass} ${shadowClass}`}
                  />

                  {/* DAY LABEL */}
                  <span className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-tighter">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [weeklyNewUsers, setWeeklyNewUsers] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyIncome, setWeeklyIncome] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyStorage, setWeeklyStorage] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  //Stores comparison between weeks.
  const [comparison, setComparison] = useState({
    users: { current: 0, last: 0, diff: 0, weekLabel: 'This Week' },
    income: { current: 0, last: 0, diff: 0, weekLabel: 'This Week' },
    storage: { current: 0, last: 0, diff: 0 },
  });

  //Stores yearly chart info.
  const [yearlyData, setYearlyData] = useState([
    { month: 'Jan', web: 0, mobile: 0, income: 0 },
    { month: 'Feb', web: 0, mobile: 0, income: 0 },
    { month: 'Mar', web: 0, mobile: 0, income: 0 },
    { month: 'Apr', web: 0, mobile: 0, income: 0 },
    { month: 'May', web: 0, mobile: 0, income: 0 },
    { month: 'Jun', web: 0, mobile: 0, income: 0 },
    { month: 'Jul', web: 0, mobile: 0, income: 0 },
    { month: 'Aug', web: 0, mobile: 0, income: 0 },
    { month: 'Sep', web: 0, mobile: 0, income: 0 },
    { month: 'Oct', web: 0, mobile: 0, income: 0 },
    { month: 'Nov', web: 0, mobile: 0, income: 0 },
    { month: 'Dec', web: 0, mobile: 0, income: 0 },
  ]);

  const [hoveredMonth, setHoveredMonth] = useState(null);

  //Runs once when page loads, fetches all report data from backend and populates states.
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get('/api/subscriptions/reports/');
        const data = response.data;

        //Stores data in React state.
        setWeeklyNewUsers(data.weekly_new_users || []);
        setWeeklyIncome(data.weekly_income || []);
        setWeeklyStorage(data.weekly_storage || []);
        setComparison(data.comparison || comparison);
        if (data.labels) setChartLabels(data.labels);
        
        if (data.yearly_data) {
          setYearlyData(prev => prev.map(m => {
            const dbMonth = data.yearly_data.find(d => d.month === m.month);
            return dbMonth ? { ...m, ...dbMonth } : m;
          }));
        }
      } catch (err) {
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message;
        console.error("Failed to fetch report data:", msg);
        setError(msg || "Unable to load reports from database.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
          <Info className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-black text-gray-800 mb-2">System Error</h2>
          <p className="text-gray-500 font-medium mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Dynamic max values ensure graphs stay clean regardless of data volume
  const maxWeeklyIncome = Math.max(...weeklyIncome) || 1;
  const maxWeeklyUsers = Math.max(...weeklyNewUsers) || 1;
  const maxWeeklyStorage = Math.max(...weeklyStorage) || 1;
  const maxYearlyValue = Math.max(...yearlyData.map(d => Math.max(d.web, d.mobile)), 1);

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
            unit="Rs."
          />
          <ComparisonCard
            label={`${comparison.income.weekLabel} Storage`}
            current={comparison.storage.current}
            last={comparison.storage.last}
            diff={comparison.storage.diff}
            unit="GB"
          />
        </div>

        {/* Weekly Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <WeeklyBarChart 
            title="New Users This Week" 
            data={weeklyNewUsers} 
            unit="Users" 
            colorClass="bg-orange-500" 
            shadowClass="shadow-orange-200 shadow-lg" 
            maxVal={maxWeeklyUsers} 
            chartLabels={chartLabels}
            
          />

          <WeeklyBarChart 
            title="Daily Income (Rs.)" 
            data={weeklyIncome} 
            unit="Rs." 
            colorClass="bg-emerald-500" 
            shadowClass="shadow-emerald-200 shadow-lg" 
            maxVal={maxWeeklyIncome} 
            chartLabels={chartLabels}
          />
          <WeeklyBarChart 
            title="Storage Utilization (GB)" 
            data={weeklyStorage} 
            unit="GB" 
            colorClass="bg-blue-500" 
            shadowClass="shadow-blue-200 shadow-lg" 
            maxVal={maxWeeklyStorage} 
            chartLabels={chartLabels}
          />
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
              points={yearlyData.map((d, i) => `${(i * 1000) / 11},${200 - (d.web / (maxYearlyValue * 1.2)) * 200}`).join(' ')}
              className="drop-shadow-xl transition-all duration-700"
            />
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={yearlyData.map((d, i) => `${(i * 1000) / 11},${200 - (d.mobile / (maxYearlyValue * 1.2)) * 200}`).join(' ')}
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
                  <span className="font-black text-emerald-400 text-sm">Rs. {hoveredMonth.income.toLocaleString()}</span>
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
        {unit === 'Rs.' && 'Rs. '}
        {current.toLocaleString()}
        {unit !== 'Rs.' && unit !== 'Users' && ` ${unit}`}
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