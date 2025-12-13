import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css"; 
import logo_dark from "../../assets/Logo_on_Dark.png";
import GradientButton from "../GradientButton/GradientButton";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // ✅ Import AuthContext

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // ✅ Get auth info from context
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={logo_dark} alt="logo" />
        </div>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </div>
        
      <div className={`nav-center ${menuOpen ? "active" : ""}`}>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/features">Features</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>

        <div className="mobile-auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="welcome-text">Hi, {user}</span>
              <GradientButton title="Dashboard" to="/dashboard" />
              <GradientButton title="Logout" onClick={logout} />
            </>
          ) : (
            <>
              <GradientButton title="Register" to="/register" />
              <GradientButton title="Login" to="/login" />
            </>
          )}
        </div>
      </div>

      <div className="nav-right">
        {isAuthenticated ? (
          <>
            <span className="welcome-text">Hi, {user}</span>
            <GradientButton title="Dashboard" to="/dashboard" />
            <GradientButton title="Logout" onClick={logout} />
          </>
        ) : (
          <>
            <GradientButton title="Register" to="/register" />
            <GradientButton title="Login" to="/login" />
          </>
        )}
      </div>
    </nav>
  );
}
