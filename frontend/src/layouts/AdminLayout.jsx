import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar with isAdmin=true to show admin tabs */}
      <Sidebar isAdmin={true} />

      <div className="flex-1 flex flex-col">
        {/* Navbar with isDashboard=true to show search/profile */}
        <Navbar isDashboard={true} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}