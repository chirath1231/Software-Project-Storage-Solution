import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin <span className="text-orange-500">Dashboard</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Manage users, system health, and settings
        </p>
      </div>

      {/* Example Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <h2 className="text-lg font-bold mb-2">Total Users</h2>
          <p className="text-3xl font-semibold text-gray-700">1,245</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h2 className="text-lg font-bold mb-2">Active Sessions</h2>
          <p className="text-3xl font-semibold text-gray-700">34</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <h2 className="text-lg font-bold mb-2">Server Status</h2>
          <p className="text-3xl font-semibold text-green-600">Healthy</p>
        </div>
      </div>
    </div>
  );
}
