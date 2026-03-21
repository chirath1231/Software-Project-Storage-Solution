import React from "react";
import { DollarSign, Users, TrendingUp } from "lucide-react";

export default function AdminSubscriptionAnalytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Subscription <span className="text-orange-500">Analytics</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Track revenue, user growth, and plan performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold mb-2">Total Revenue</h2>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-3xl font-semibold text-gray-700">$12,345.67</p>
          <p className="text-sm text-gray-400 mt-1">+5.2% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold mb-2">Active Subscriptions</h2>
            <Users className="text-blue-500" />
          </div>
          <p className="text-3xl font-semibold text-gray-700">890</p>
          <p className="text-sm text-gray-400 mt-1">15 new today</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold mb-2">Monthly Recurring Revenue</h2>
            <TrendingUp className="text-orange-500" />
          </div>
          <p className="text-3xl font-semibold text-gray-700">$2,150.00</p>
          <p className="text-sm text-gray-400 mt-1">Projected to grow</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-bold mb-4">Revenue Over Time</h2>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-bold mb-4">Subscription Tiers</h2>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-400">Pie chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}