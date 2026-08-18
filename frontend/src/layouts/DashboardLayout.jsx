import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";
import ChatAssistant from "../components/ChatAssistant/ChatAssitant";
// C:\Users\USER\Desktop\software_project\Software-Project-Storage-Solution\frontend\src\components\ChatAssistant\ChatAssitant.jsx
export default function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen">

      <Navbar className="mb-0" />  {/* ← gap below navbar */}

      <div className="flex flex-1 mt-6">  {/* ← space between navbar and sidebar/main */}
        <Sidebar />  {/* ← more left padding inside sidebar */}

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <div className="mt-14">  {/* ← gap above footer */}
        <Footer />
      </div>

      <ChatAssistant />
    </div>
  );
}