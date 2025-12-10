import React, { useState } from "react";
import "./NavBar.css"; 
import logo_dark from "../../assets/Logo_on_Dark.png";
import GradientButton from "../GradientButton/GradientButton";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={logo_dark} alt="logo" />
        </div>
      </div>

      {/* Hamburger for mobile */}
      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </div>

      {/* Center nav links */}
      <div className={`nav-center ${menuOpen ? "active" : ""}`}>
        <ul className="nav-links">

          {/* SCROLL LINKS */}
          <li>
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          </li>
          <li>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          </li>
          <li>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          </li>
          <li>
            <a href="#aboutus" onClick={() => setMenuOpen(false)}>About Us</a>
          </li>

        </ul>

        {/* Mobile login/register */}
        <div className="mobile-auth-buttons">
          <GradientButton title="Register" to="/register" />
          <GradientButton title="Login" to="/login" />
        </div>
      </div>

      {/* Desktop login/register */}
      <div className="nav-right">
        <GradientButton title="Register" to="/register" />
        <GradientButton title="Login" to="/login" />
      </div>
    </nav>
  );
}
