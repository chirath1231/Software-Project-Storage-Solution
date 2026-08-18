import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutDashboard,
  Folder,
  Users,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  Menu,
  X,
  Trash2,
  BarChart2,
  TrendingUp,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function Sidebar({ isAdmin = false }) {
  const navigate = useNavigate(); // For programmatic navigation
  const location = useLocation(); // Gets current URL path
  const { hasPermission } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard"); // State to store currently active menu item

  // 🔹 Menu config with ROUTES
  const userMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
    { id: "files", label: "My Files", icon: <Folder />, path: "/dashboard/files" },
    { id: "trash", label: "Trash", icon: <Trash2 />, path: "/dashboard/trash" },
    { id: "clients", label: "Clients", icon: <Users />, path: "/dashboard/chat" },
    { id: "subscription", label: "Subscription", icon: <CreditCard />, path: "/dashboard/subscription" },
    { id: "notifications", label: "Notifications", icon: <Bell />, path: "/dashboard/notifications" },
    { id: "settings", label: "Settings", icon: <Settings />, path: "/dashboard/settings" },
    { id: "support", label: "Support", icon: <HelpCircle />, path: "/dashboard/support" }
  ];

  const adminMenuItems = [
    { id: "overview", label: "Admin Overview", icon: <LayoutDashboard />, path: "/admin/overview" },
    { id: "tickets", label: "Ticket Submissions", icon: <FileText />, path: "/admin/tickets", requiredPermission: "support.view" },
    { id: "admin_settings", label: "Admin Settings", icon: <Settings />, path: "/admin/settings", requiredPermission: "settings.view" },
    { id: "admin_permissions", label: "Admin Permissions", icon: <ShieldCheck />, path: "/admin/permissions", requiredPermission: "admin_permissions.manage" },
  ];

  const menuItems = isAdmin
    ? adminMenuItems.filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission))
    : userMenuItems;

  // 🔥 FIXED LOGIC HERE (longest path match first)
  // Sort menu items by longest path first
  useEffect(() => {
    const sortedMenu = [...menuItems].sort(
      (a, b) => b.path.length - a.path.length
    );

     // Find matching menu item based on current URL path
    const current = sortedMenu.find((item) =>
      location.pathname.startsWith(item.path)
    );

    if (current) {
      setActiveItem(current.id);
    }
  }, [location.pathname, menuItems]);

  // Function to handle sidebar click and navigate to the corresponding route
  const handleMenuClick = (item) => {
    navigate(item.path);

    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div className="md:static bg-transparent">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-20 z-50 p-3 bg-gradient-to-b from-orange-500 to-amber-400 text-white rounded-xl shadow-lg md:hidden hover:scale-105 active:scale-95 transition-all duration-300 ${
          isOpen ? "left-[295px] rotate-90" : "left-4 rotate-0"
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-35 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="flex">
        <div
          className={`
<<<<<<< HEAD
            w-[280px] min-h-screen
            bg-gradient-to-b from-white via-orange-50 to-orange-200 
=======
            w-[280px] h-screen md:h-auto md:min-h-[calc(100vh-120px)]
            bg-gradient-to-b from-white via-orange-50 to-orange-200
>>>>>>> origin/main
            flex flex-col py-6
            transition-all duration-300 ease-in-out
            z-40
            
            ${
              isOpen 
                ? "fixed inset-y-0 left-0 translate-x-0 mt-0 ml-0 mr-0 mb-0 rounded-none rounded-r-3xl shadow-2xl" 
                : "fixed inset-y-0 left-0 -translate-x-full mt-0 ml-0 mr-0 mb-0"
            }
            md:relative md:translate-x-0 md:w-[260px] md:mt-5 md:ml-10 md:mr-10 md:mb-5 md:rounded-2xl
            lg:w-[280px]
            xl:w-[300px]
          `}
        >
          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`
                  flex items-center gap-4
                  py-3.5 px-5
                  rounded-3xl cursor-pointer
                  transition-all duration-300
                  text-base font-medium
                  min-h-[48px]
                  
                  ${
                    // Active state with gradient and shadow
                    activeItem === item.id
                      ? "bg-gradient-to-b from-orange-500 to-amber-400 text-white font-semibold shadow-lg shadow-orange-500/30 scale-[1.02]"
                      : "text-gray-700 hover:bg-orange-500/10 hover:text-orange-600 hover:scale-[1.01]"
                  }
                `}
              >
                <span className="text-[22px] flex items-center flex-shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </nav>


        </div>
      </div>
    </div>
  );
}
