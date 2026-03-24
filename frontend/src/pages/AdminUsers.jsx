import React from "react";

export default function AdminUsers() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          User <span className="text-orange-500">Management</span>
        </h1>
        <p className="text-gray-500 mt-1">View and manage all registered users.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <p className="text-gray-600">User list table will go here...</p>
      </div>
    </div>
  );
}