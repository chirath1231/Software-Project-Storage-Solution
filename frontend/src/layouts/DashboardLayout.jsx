import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";
import ChatAssistant from "../components/ChatAssistant/ChatAssistant";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <Footer />
        <ChatAssistant />
      </div>
    </div>
  );
}
