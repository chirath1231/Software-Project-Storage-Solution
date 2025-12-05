import React from "react";
import { Link } from "react-router-dom";  
import "./GradientButton.css";


const GradientButton = ({ title, to, onClick, className = "" }) => {
  if (to) {
    return (
      <Link to={to} className={`gradient-btn ${className}`}>
        {title}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={`gradient-btn ${className}`}>
      {title}
    </button>
  );
};

export default GradientButton;
