import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/NavBar/NavBar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="flex">
        <Sidebar/>
        <main className="flex-1">
          <Outlet /> {/* This is required to see MyFiles or DashboardHome */}
        </main>
      </div>
      <Footer/>
    </div>
  );
}