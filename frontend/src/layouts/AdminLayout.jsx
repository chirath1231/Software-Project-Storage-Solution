import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Navbar spanning full width across top of page */}
      <Navbar isDashboard={true} />

      {/* Middle row: Sidebar on left + Page content on right */}
      <div className="flex flex-1">
        <Sidebar isAdmin={true} />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Footer spanning full width across bottom of page */}
      <Footer />
    </div>
  );
}