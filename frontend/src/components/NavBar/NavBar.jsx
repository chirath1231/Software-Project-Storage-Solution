import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Search, User, ChevronDown, Bell } from "lucide-react";
import logo_dark from "../../assets/Logo_on_Dark.png";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNotifications } from '../../context/NotificationContext';

// Mock logo component
const LogoDark = () => (
  <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
    <div className="flex-none mr-auto">
      <img
        src={logo_dark}
        alt="CEYNOA Logo"
        className="h-10 w-auto"
      />
    </div>
  </div>
);

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
  const { isAuthenticated, username, login, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- GRAB LIVE DATA FROM THE GLOBAL BRAIN ---
  const { notifications, unreadCount, fetchGlobalNotifications, setNotifications } = useNotifications();

  const showDashboardView = isAuthenticated || isDashboard;
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const userData = {
    name: "User",
    email: "user@example.com",
    avatar: null
  };

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

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const handleNavClick = (href) => {
    setMenuOpen(false);
  };

  // --- INTERACT WITH DJANGO TO MARK AS READ ---
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://localhost:8000/api/accounts/notifications/${notificationId}/read/`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      // Tell the global brain to refresh the list!
      fetchGlobalNotifications();
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  const markAllAsRead = () => {
    // Instantly update the UI state locally so it feels fast
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const clearNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <nav className="py-4 relative shadow-lg bg-[#323D41]">
      <div className="max-w-7xl mx-auto px-0 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-none mr-auto">
          <LogoDark />
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white p-2 hover:bg-gray-700 rounded transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center section */}
        <div className={`
          flex-1 flex justify-center items-center mx-10
          ${menuOpen ? 'flex' : 'hidden'} md:flex
          md:relative absolute top-full left-0 right-0 bg-gray-800 md:bg-transparent
          flex-col md:flex-row p-5 md:p-0 z-50 shadow-lg md:shadow-none
        `}>
          {!showDashboardView ? (
            <ul className="flex flex-col md:flex-row list-none gap-8 m-0 p-0 items-center w-full md:w-auto rounded-full border border-gray-500 py-3.5 px-8 md:px-20">
              {/* Public Links */}
            </ul>
          ) : (
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                  {/* Dynamic Unread Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl w-80 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                      <h3 className="text-gray-800 font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-orange-500 text-xs hover:text-orange-600">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-orange-50/50' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-gray-800 font-medium text-sm">{notification.title}</h4>
                                  {!notification.is_read && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>}
                                </div>
                                <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                                {/* Formatted Django Timestamp */}
                                <p className="text-gray-400 text-[10px] mt-1 font-medium">
                                  {new Date(notification.created_at).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); clearNotification(notification.id); }} className="text-gray-400 hover:text-red-500 mt-1">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-3 py-2 px-3 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-600">
                    <User size={24} className="text-orange-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <div className="text-white text-sm font-semibold">{username || userData.name}</div>
                    <div className="text-gray-400 text-xs">{userData.email}</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl min-w-[200px] z-50 overflow-hidden">
                    <button className="w-full py-3 px-4 text-left hover:bg-gray-100 text-sm text-gray-800" onClick={() => setShowProfileMenu(false)}>My Profile</button>
                    <button className="w-full py-3 px-4 text-left hover:bg-gray-100 text-sm text-gray-800" onClick={() => setShowProfileMenu(false)}>Settings</button>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <button className="w-full py-3 px-4 text-left hover:bg-red-50 text-sm text-red-500 font-medium" onClick={handleLogout}>Logout</button>
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