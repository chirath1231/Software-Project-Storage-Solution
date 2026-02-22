import React from "react";
import { Link } from "react-router-dom";

export default function MyProfile() {
  // Static mock data for frontend development
  const userData = {
    firstName: "Mehrab",
    lastName: "Bozorgi",
    email: "Mehrabbozorgi.business@gmail.com",
    address: "33062 Zboncak isle",
    contactNumber: "58077.79",
    city: "Mehrab",
    state: "Bozorgi",
  };

  const handleLogout = () => {
    // Add your actual logout logic here later (e.g., clearing tokens, redirecting to login)
    console.log("User logged out");
    window.location.href = "/login"; // Simple redirect for now
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header & Avatar Section */}
      <div className="flex justify-between items-start mb-10">
        <div className="border-l-4 border-orange-500 pl-4">
          <h1 className="text-3xl font-bold text-[#2A2B3D]">My Profile</h1>
        </div>
        
        {/* Profile Avatar */}
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          
          {/* First Name */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-1 font-medium">First Name</span>
            <span className="text-lg font-semibold text-gray-800">{userData.firstName}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-1 font-medium">Last Name</span>
            <span className="text-lg font-semibold text-gray-800">{userData.lastName}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
          </div>

          {/* Email (Full Width) */}
          <div className="flex flex-col md:col-span-2 relative">
            <span className="text-sm text-gray-500 mb-1 font-medium">Email</span>
            <span className="text-lg font-semibold text-gray-800">{userData.email}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
            
            {/* Verified Badge */}
            <div className="absolute right-0 top-6 flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </div>
          </div>

          {/* Address (Full Width) */}
          <div className="flex flex-col md:col-span-2">
            <span className="text-sm text-gray-500 mb-1 font-medium">Address</span>
            <span className="text-lg font-semibold text-gray-800">{userData.address}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
          </div>

          {/* Contact Number (Full Width) */}
          <div className="flex flex-col md:col-span-2">
            <span className="text-sm text-gray-500 mb-1 font-medium">Contact Number</span>
            <span className="text-lg font-semibold text-gray-800">{userData.contactNumber}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
          </div>

          {/* City */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-1 font-medium">City</span>
            <span className="text-lg font-semibold text-gray-800">{userData.city}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
          </div>

          {/* State */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-1 font-medium">State</span>
            <span className="text-lg font-semibold text-gray-800">{userData.state}</span>
            <div className="h-px bg-gray-100 mt-3 w-full"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/dashboard/edit-profile">
            <button className="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-xl shadow-md hover:from-orange-500 hover:to-orange-600 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              Edit Profile
            </button>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-white border-2 border-red-500 text-red-500 font-bold rounded-xl shadow-sm hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}