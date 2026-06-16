import React, { useState, useEffect, useRef, use } from "react";
import { Menu, X, Search, User, ChevronDown, Bell } from "lucide-react";
import logo_dark from "../../assets/Logo_on_Dark.png";
import { useAuth } from "../../auth/AuthContext.jsx";

// Mock logo - replace with your actual import
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
  
  const showDashboardView = isAuthenticated || isDashboard;
  
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // User data - would come from auth context in real app
  const userData = {
    name: "Natasha Avory",
    email: "natasha@example.com",
    avatar: null
  };

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New message received",
      message: "You have a new message from John Doe",
      time: "5 min ago",
      read: false
    },
    {
      id: 2,
      title: "System update",
      message: "Your system has been updated successfully",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "Welcome!",
      message: "Welcome to CEYNOA platform",
      time: "2 hours ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

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

const handleLogin = () => {
  login("dummy-token", "Natasha Avory"); // replace with real login response
  setMenuOpen(false);
};

const handleLogout = () => {
  logout();
  setShowProfileMenu(false);
  setShowNotifications(false);
};


  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
    }
  };

  const handleNavClick = (href) => {
    setMenuOpen(false);
    // In real app, handle navigation here
    console.log("Navigate to:", href);
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <nav className="py-4 relative shadow-lg bg-[#323D41]">
      <div className="max-w-7xl mx-auto px-0  flex items-center justify-between">
        {/* Logo */}
        <div className="flex-none mr-auto ">
          <LogoDark />
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden text-white p-2 hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center section - Navigation or Search */}
        <div className={`
          flex-1 flex justify-center items-center mx-10
          ${menuOpen ? 'flex' : 'hidden'} md:flex
          md:relative absolute top-full left-0 right-0 bg-gray-800 md:bg-transparent
          flex-col md:flex-row p-5 md:p-0 z-50 shadow-lg md:shadow-none
        `}>
          {!showDashboardView ? (
            // Navigation links (before login)
            <ul className="flex flex-col md:flex-row list-none gap-8 m-0 p-0 items-center w-full md:w-auto rounded-full border border-gray-500 py-3.5 px-8 md:px-20 ">
              {[
                { href: "#home", label: "Home" },
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "#aboutus", label: "About Us" }
              ].map((item) => (
                <li key={item.href} className="m-0 before:content-none" >
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
            // Search bar (after login)
            <div className="relative w-full max-w-xl">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={18} 
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search"
                className="w-full py-3 pl-12 pr-4 rounded-full bg-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              />
            </div>
          )}

          {/* Mobile auth buttons (only when logged out) */}
          {!showDashboardView && (
            <div className="flex md:hidden gap-3 mt-5 w-full flex-col sm:flex-row">
              <GradientButton 
                title="Register" 
                onClick={() => window.location.href = "/register"}
                ariaLabel="Register for an account"
              />
              <GradientButton 
                title="Login" 
                onClick={() => window.location.href = "/login"}
                ariaLabel="Login to your account"
              />
            </div>
          )}
        </div>

        {/* Right section - Auth buttons or Profile */}
        <div className="hidden md:flex gap-3 items-center relative">
          {!showDashboardView ? (
            // Auth buttons (before login)
            <>
              <GradientButton 
              title="Register" 
              onClick={() => window.location.href = "/register"}
              ariaLabel="Register for an account"
              />
              <GradientButton 
              title="Login" 
              onClick={() => window.location.href = "/login"}
              ariaLabel="Login to your account"
              />
            </>
            ) : (
            // Notifications and User profile (after login)
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  aria-expanded={showNotifications}
                  aria-haspopup="true"
                >
                  <Bell size={22} className="text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div 
                    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl w-80 z-50 overflow-hidden"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                      <h3 className="text-gray-800 font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-orange-500 text-xs hover:text-orange-600 focus:outline-none"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-gray-800 font-medium text-sm">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-xs mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500 focus:outline-none"
                                aria-label="Clear notification"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-200 text-center">
                        <button
                          className="text-orange-500 text-sm hover:text-orange-600 focus:outline-none font-medium"
                          onClick={() => console.log("View all notifications")}
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-3 py-2 px-3 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  aria-label="User menu"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-600">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt={username} className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-orange-500" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <div className="text-white text-sm font-semibold">{username || userData.name}</div>
                    <div className="text-gray-400 text-xs">{userData.email}</div>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <div 
                    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl min-w-[200px] z-50 overflow-hidden"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <button
                      className="w-full py-3 px-4 text-left hover:bg-gray-100 transition-colors text-sm text-gray-800 focus:outline-none focus:bg-gray-100"
                      onClick={() => {
                        console.log("Profile");
                        setShowProfileMenu(false);
                      }}
                      role="menuitem"
                    >
                      My Profile
                    </button>
                    <button
                      className="w-full py-3 px-4 text-left hover:bg-gray-100 transition-colors text-sm text-gray-800 focus:outline-none focus:bg-gray-100"
                      onClick={() => {
                        console.log("Settings");
                        setShowProfileMenu(false);
                      }}
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <div className="h-px bg-gray-200 my-1" role="separator"></div>
                    <button
                      className="w-full py-3 px-4 text-left hover:bg-red-50 transition-colors text-sm text-red-500 font-medium focus:outline-none focus:bg-red-50"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      Logout
                    </button>
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