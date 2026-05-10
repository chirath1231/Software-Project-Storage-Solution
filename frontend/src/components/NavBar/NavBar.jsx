import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Search, User, ChevronDown, Bell } from "lucide-react";
import logo_dark from "../../assets/Logo_on_Dark.png";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNotifications } from '../../context/NotificationContext';

// ... (LogoDark and GradientButton components stay the same)
const GradientButton = ({ title, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel || title}
    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-800"
  >
    {title}
  </button>
);
export default function Navbar({ isDashboard = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, username, logout } = useAuth(); // Removed unused 'login'
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { notifications, unreadCount, fetchGlobalNotifications, setNotifications } = useNotifications();

  const showDashboardView = isAuthenticated || isDashboard;
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showProfileMenu || showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu, showNotifications]);

  // --- FIX: Updated URL to match modular backend ---
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      // Updated endpoint path to include /accounts/
      await fetch(`http://localhost:8000/api/accounts/notifications/${notificationId}/read/`, {
        method: "PATCH",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
        }
      });
      fetchGlobalNotifications();
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  const markAllAsRead = () => {
    // You could also add a backend endpoint for this, 
    // but local update keeps it snappy
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const clearNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  // ... (toggleMenu, handleSearch, handleNavClick logic stays the same)

  return (
    <nav className="py-4 relative shadow-lg bg-[#323D41]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-none">
          <img src={logo_dark} alt="CEYNOA Logo" className="h-10 w-auto" />
        </div>

        {/* ... (Mobile menu toggle button stays same) */}

        {/* Center section (Search or Nav links) */}
        <div className={`
          flex-1 flex justify-center items-center mx-10
          ${menuOpen ? 'flex' : 'hidden'} md:flex
          md:relative absolute top-full left-0 right-0 bg-gray-800 md:bg-transparent
          flex-col md:flex-row p-5 md:p-0 z-50 shadow-lg md:shadow-none
        `}>
          {!showDashboardView ? (
             <ul className="flex flex-col md:flex-row list-none gap-8 m-0 p-0 items-center rounded-full border border-gray-500 py-3.5 px-20">
               {/* ... mapping links */}
             </ul>
          ) : (
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search files or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-12 pr-4 rounded-full bg-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              />
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="hidden md:flex gap-3 items-center relative">
          {!showDashboardView ? (
            <>
              <GradientButton title="Register" onClick={() => window.location.href = "/register"} />
              <GradientButton title="Login" onClick={() => window.location.href = "/login"} />
            </>
          ) : (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                >
                  <Bell size={22} className="text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#323D41]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-4 bg-white rounded-xl shadow-2xl w-80 z-50 overflow-hidden border border-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-gray-800 font-bold text-xs uppercase tracking-wider">Alerts</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-orange-500 text-xs font-semibold hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => ( // Show top 5 in dropdown
                          <div
                            key={notification.id}
                            className={`px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-orange-50/30' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                               <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.is_read ? 'bg-transparent' : 'bg-orange-500'}`} />
                               <div className="flex-1">
                                 <h4 className={`text-gray-800 text-sm leading-tight ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>{notification.title}</h4>
                                 <p className="text-gray-500 text-xs mt-1 line-clamp-2">{notification.message}</p>
                                 <p className="text-gray-400 text-[10px] mt-2 font-semibold uppercase">
                                   {new Date(notification.created_at).toLocaleDateString()}
                                 </p>
                               </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-10 text-center text-gray-400 text-sm italic">No new alerts</div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                        <button 
                            onClick={() => window.location.href = "/notifications"} 
                            className="text-gray-600 text-xs font-bold hover:text-orange-500 transition-colors"
                        >
                            View All Activity
                        </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-3 py-1.5 px-2 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-500/10 border border-orange-500/20">
                    <User size={20} className="text-orange-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="text-white text-sm font-bold leading-none">{username || "User"}</div>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-4 bg-white rounded-xl shadow-2xl min-w-[220px] z-50 overflow-hidden border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{username}</p>
                    </div>
                    <button className="w-full py-3 px-4 text-left hover:bg-gray-50 text-sm text-gray-700 font-medium" onClick={() => window.location.href="/profile"}>My Profile</button>
                    <button className="w-full py-3 px-4 text-left hover:bg-gray-50 text-sm text-gray-700 font-medium" onClick={() => window.location.href="/settings"}>Settings</button>
                    <div className="h-px bg-gray-100 mx-2"></div>
                    <button className="w-full py-3 px-4 text-left hover:bg-red-50 text-sm text-red-500 font-bold" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          )} 
        </div>
      </div>
    </nav>
  );
}