import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Search, User, ChevronDown, Bell } from "lucide-react";
import logo_dark from "../../assets/Logo_on_Dark.png";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx"; 

const LogoDark = () => (
  <div className="flex items-center">
    <img
      src={logo_dark}
      alt="CEYNOA Logo"
      className="h-10 w-auto"
    />
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
  const { isAuthenticated, username, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const showDashboardView = isAuthenticated || isDashboard;
  
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Unified Notifications State Management
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New message received",
      message: "You have a new message from John Doe",
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      is_read: false
    },
    {
      id: 2,
      title: "System update",
      message: "Your system has been updated successfully",
      created_at: new Date(Date.now() - 60 * 60000).toISOString(),
      is_read: false
    },
    {
      id: 3,
      title: "Welcome!",
      message: "Welcome to CEYNOA platform",
      created_at: new Date(Date.now() - 120 * 60000).toISOString(),
      is_read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
    console.log("Navigate to:", href);
  };

  // --- API PATCH Implementation ---
  const markAsRead = async (notificationId) => {
    // Optimistic Local UI State Mutation
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));

    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://localhost:8000/api/accounts/notifications/${notificationId}/`, {
        method: "PATCH",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
        }
      });
    } catch (error) {
      console.error("Failed to mark read on server:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const clearNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <nav className="py-4 relative shadow-lg bg-[#323D41]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex-none">
          <LogoDark />
        </div>

        {/* Center section (Search bar or Navigation links) */}
        <div className={`
          flex-1 flex justify-center items-center mx-10
          ${menuOpen ? 'flex' : 'hidden'} md:flex
          md:relative absolute top-full left-0 right-0 bg-[#323D41] md:bg-transparent
          flex-col md:flex-row p-5 md:p-0 z-50 shadow-lg md:shadow-none
        `}>
          {!showDashboardView ? (
            // Public Navigation links (Before Login)
            <ul className="flex flex-col md:flex-row list-none gap-8 m-0 p-0 items-center w-full md:w-auto rounded-full border border-gray-500 py-3.5 px-8 md:px-20">
              {[
                { href: "#home", label: "Home" },
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "#aboutus", label: "About Us" }
              ].map((item) => (
                <li key={item.href} className="m-0 before:content-none">
                  <a
                    href={item.href}
                    className="text-white no-underline text-base font-medium hover:text-orange-400 transition-colors focus:outline-none focus:text-orange-400"
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            // Main App Search bar (After Login)
            <div className="relative w-full max-w-xl">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={18} 
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search files or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search"
                className="w-full py-3 pl-12 pr-4 rounded-full bg-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              />
            </div>
          )}

          {/* Mobile Auth Buttons Toggle */}
          {!showDashboardView && (
            <div className="flex md:hidden gap-3 mt-5 w-full flex-col sm:flex-row">
              <GradientButton title="Register" onClick={() => window.location.href = "/register"} />
              <GradientButton title="Login" onClick={() => window.location.href = "/login"} />
            </div>
          )}
        </div>

        {/* Right Section: Actions Panel (Auth Controls or Profile Context) */}
        <div className="flex gap-3 items-center relative">
          {!showDashboardView ? (
            <div className="hidden md:flex gap-3">
              <GradientButton title="Register" onClick={() => window.location.href = "/register"} />
              <GradientButton title="Login" onClick={() => window.location.href = "/login"} />
            </div>
          ) : (
            <>
              {/* Notification Center Trigger */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <Bell size={22} className="text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#323D41]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel Box Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-4 bg-white rounded-xl shadow-2xl w-80 z-50 overflow-hidden border border-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-gray-800 font-bold text-xs uppercase tracking-wider">Alerts</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-orange-500 text-xs font-semibold hover:underline bg-transparent border-0 cursor-pointer">
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.is_read ? 'bg-orange-50/30' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notification.is_read ? 'bg-transparent' : 'bg-orange-500'}`} />
                              <div className="flex-1">
                                <h4 className={`text-gray-800 text-sm leading-tight ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>{notification.title}</h4>
                                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{notification.message}</p>
                                <p className="text-gray-400 text-[10px] mt-2 font-semibold uppercase">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer p-0"
                              >
                                <X size={14} />
                              </button>
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
                        className="text-gray-600 text-xs font-bold hover:text-orange-500 transition-colors w-full bg-transparent border-0 cursor-pointer"
                      >
                        View All Activity
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Navigation Trigger */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-3 py-1.5 px-2 rounded-full hover:bg-gray-700 transition-colors bg-transparent border-0 cursor-pointer"
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

                {/* Profile Options Context Menu */}
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-4 bg-white rounded-xl shadow-2xl min-w-[220px] z-50 overflow-hidden border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{username || "Workspace Account"}</p>
                    </div>
                    <button className="w-full py-3 px-4 text-left hover:bg-gray-50 text-sm text-gray-700 font-medium bg-transparent border-0 cursor-pointer" onClick={() => window.location.href="/profile"}>My Profile</button>
                    <button className="w-full py-3 px-4 text-left hover:bg-gray-50 text-sm text-gray-700 font-medium bg-transparent border-0 cursor-pointer" onClick={() => window.location.href="/settings"}>Settings</button>
                    <div className="h-px bg-gray-100 mx-2"></div>
                    <button className="w-full py-3 px-4 text-left hover:bg-red-50 text-sm text-red-500 font-bold bg-transparent border-0 cursor-pointer" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Desktop Hamburg Menu Icon for Mobile view scaling toggle */}
          <button
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden text-white p-2 hover:bg-gray-700 rounded transition-colors bg-transparent border-0 cursor-pointer"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>
    </nav>
  );
}