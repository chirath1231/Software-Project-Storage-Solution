import React, { useState} from "react";
import { Link } from "react-router-dom";
import "./NavBar.css"; 
import Logo_on_Dark from "../../assets/Logo_on_Dark.png";
import GradientButton from "../GradientButton/GradientButton";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={Logo_on_Dark} alt="logo" />
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
          <GradientButton title="Register" to="/register" />
          <GradientButton title="Login" to="/login" />
        </div>
      </div>

      <div className="nav-right">
        <GradientButton title="Register" to="/register" />
        <GradientButton title="Login" to="/login" />
        {/* <Link to="/login" className="auth-btn">Login</Link>
        <Link to="/register" className="auth-btn register-btn">Register</Link> */}
      </div>
    </nav>
  );
  
}