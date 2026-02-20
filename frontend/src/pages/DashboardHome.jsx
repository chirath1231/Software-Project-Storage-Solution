import React from "react";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const storageUsed = 70;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, <span className="text-orange-500">User</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here’s a quick look at your storage and recent activity
        </p>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Storage Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-6">
            Storage Overview
          </h2>

          <div className="flex items-center gap-6">
            {/* Circle Progress */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeDasharray={`${storageUsed}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {storageUsed}%
              </div>
            </div>

            <div>
              <p className="text-xl font-semibold">
                70GB / 100GB
              </p>
  <Link to="/dashboard/subscription">
              <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm transition">
                Upgrade Plan
              </button>
  </Link>
            </div>
          </div>
        </div>

        {/* Quick Upload */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold mb-6">
            Quick Upload
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition cursor-pointer">
            <p className="text-lg font-semibold text-gray-700">
              Upload Files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Drag and drop or browse to upload (Max 2GB)
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Files */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Recent Files
            </h2>
            <button className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm">
              See All
            </button>
          </div>

          <div className="space-y-4">
            {["Project.pdf", "Video.mp4", "Image.png"].map((file, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
              >
                <div>
                  <p className="font-medium">{file}</p>
                  <p className="text-xs text-gray-500">
                    05/12/2025 • 10GB
                  </p>
                </div>
                <button className="text-gray-500 hover:text-orange-500">
                  ⬇
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Notifications
            </h2>
            <Link to="/dashboard/notifications">
              <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-4 py-1 rounded-full text-sm">
                See All
              </button>
            </Link>
          </div>

          <ul className="space-y-4 text-sm">
            <li className="flex gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
              File “Project.zip” uploaded successfully.
            </li>
            <li className="flex gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
              Shared “Video.mp4” expires in 3 days.
            </li>
            <li className="flex gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
              Payment confirmed for Premium Plan.
            </li>
          </ul>
        </div>
      </div>

      {/* Shared Files */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <h2 className="text-lg font-semibold mb-6">
          Shared Files
        </h2>

        <div className="space-y-4">
          {[1, 2].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
            >
              <div>
                <p className="font-medium">File Name</p>
                <p className="text-xs text-gray-500">
                  Shared with: UserName001 • Expiry: 30/05/2025
                </p>
              </div>
              <div className="text-sm font-medium text-gray-600">
                10GB ⬇
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
