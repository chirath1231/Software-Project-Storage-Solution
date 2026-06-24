import React from "react";
import { FileText, Download } from "lucide-react";

export default function AdminReports() {
  const reports = [
    { name: "User Activity Report", description: "Detailed log of user actions, logins, and file uploads." },
    { name: "Storage Usage Report", description: "Breakdown of storage consumption by user and file type." },
    { name: "Financial Report", description: "Summary of revenue, subscriptions, and payment transactions." },
    { name: "System Health Report", description: "Performance metrics, server status, and error logs." },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Generate <span className="text-orange-500">Reports</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Download detailed reports on system activity and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="text-blue-500" size={28} />
              <div>
                <h2 className="text-lg font-bold text-gray-800">{report.name}</h2>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-orange-500 hover:bg-orange-600 transition">
                <Download size={16} />
                Generate & Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}