import React, { useState } from "react";
import { Menu, X, Search, User, ChevronDown } from "lucide-react";
import logo_dark from "../../assets/Logo_on_Dark.png";

// Mock GradientButton component (you can replace with your actual component)
const GradientButton = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-transform hover:scale-105 active:scale-100"
  >
    {title}
  </button>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Authentication state - Change this to true to see logged-in view
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // User data - This would come from your auth system
  const [userData] = useState({
    name: "Natasha Avory",
    email: "natasha@example.com",
    avatar: null // You can add avatar URL here
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogin = () => {
    // Simulate login
    setIsLoggedIn(true);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileMenu(false);
  };

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Add your search logic here
  };

  return (
    <nav className=" py-4 relative shadow-lg" style={{ background: 'var(--secondary-color)' }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex-none mr-auto">
          <img
            src={logo_dark}
            alt="CEYNOA Logo"
            className="h-10 w-auto"
          />
        </div>

        {/* Hamburger for mobile */}
        <div className="md:hidden text-white cursor-pointer" onClick={toggleMenu}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* CENTER SECTION - Changes based on login state */}
        <div className={`
          flex-1 flex justify-center items-center mx-10
          ${menuOpen ? 'flex' : 'hidden'} md:flex
          md:relative absolute top-full left-0 right-0 bg-gray-800 md:bg-transparent
          flex-col md:flex-row p-5 md:p-0 z-50
        `}>
          {!isLoggedIn ? (
            // BEFORE LOGIN: Show navigation links
            <ul className="flex flex-col md:flex-row list-none gap-8 m-0 p-0 items-center w-full md:w-auto rounded-[150px] border border-gray py-3.5 px-[100px]">
              <li className="m-0">
                <a
                  href="#home"
                  className="text-white no-underline text-base font-medium hover:text-orange-400 transition-colors cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </a>
              </li>
              <li className="m-0">
                <a
                  href="#features"
                  className="text-white no-underline text-base font-medium hover:text-orange-400 transition-colors cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  Features
                </a>
              </li>
              <li className="m-0">
                <a
                  href="#pricing"
                  className="text-white no-underline text-base font-medium hover:text-orange-400 transition-colors cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  Pricing
                </a>
              </li>
              <li className="m-0">
                <a
                  href="#aboutus"
                  className="text-white no-underline text-base font-medium hover:text-orange-400 transition-colors cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  About Us
                </a>
              </li>
            </ul>
          ) : (
            // AFTER LOGIN: Show search bar
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full py-3 pl-12 pr-4 rounded-4xl rounded-3xl bg-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Mobile auth buttons (only when logged out) */}
          {!isLoggedIn && (
            <div className="flex md:hidden gap-3 mt-5 w-full flex-col sm:flex-row">
              <GradientButton title="Register" onClick={() => console.log("Register")} />
              <GradientButton title="Login" onClick={handleLogin} />
            </div>
          )}
        </div>

        {/* RIGHT SECTION - Changes based on login state */}
        <div className="hidden md:flex gap-3 items-center relative">
          {!isLoggedIn ? (
            // BEFORE LOGIN: Show Register/Login buttons
            <>
              <GradientButton title="Register" onClick={() => console.log("Register")} />
              <GradientButton title="Login" onClick={handleLogin} />
            </>
          ) : (
            // AFTER LOGIN: Show user profile
            <div className="relative">
              <div
                className="flex items-center gap-3 py-2 px-1 rounded-3xl cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-600">
                  {userData.avatar ? (
                    <img src={userData.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} color="#FF8C42" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-white text-sm font-semibold">{userData.name}</div>
                  <div className="text-gray-400 text-xs">{userData.email}</div>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl min-w-[200px] z-50 overflow-hidden">
                  <div
                    className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors text-sm text-gray-800"
                    onClick={() => console.log("Profile")}
                  >
                    My Profile
                  </div>
                  <div
                    className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors text-sm text-gray-800"
                    onClick={() => console.log("Settings")}
                  >
                    Settings
                  </div>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <div
                    className="py-3 px-4 cursor-pointer hover:bg-red-50 transition-colors text-sm text-red-500 font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Demo Toggle Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="py-3 px-6 bg-green-500 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-lg hover:bg-green-600 transition-colors"
        >
          {isLoggedIn ? "👋 Logout (Demo)" : "🔐 Login (Demo)"}
        </button>
      </div>
    </nav>
  );
}