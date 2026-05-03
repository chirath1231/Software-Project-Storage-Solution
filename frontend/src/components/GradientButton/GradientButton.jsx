import React from "react";
import { Link } from "react-router-dom";

const GradientButton = ({ title, to, onClick, className = "" }) => {
  const baseStyle = {
    background: "linear-gradient(90deg, var(--primary-gradient-start), var(--primary-gradient-end))",
    borderRadius: "var(--button-radius)",
  };

  const baseClass = `w-full py-3 px-0 text-white text-sm font-medium border-none cursor-pointer no-underline block text-center transition-all duration-200 hover:opacity-90 ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClass} style={baseStyle}>
        {title}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass} style={baseStyle}>
      {title}
    </button>
  );
};

export default GradientButton;