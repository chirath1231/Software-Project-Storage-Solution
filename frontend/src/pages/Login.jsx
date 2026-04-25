import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "../auth.css";
import myImage from "../assets/tech.png";
import googleLogo from "../assets/plus.png";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 2. Normal User Login Flow
    setLoading(true);
    try {
      // Determine which endpoint to hit based on the email
      const endpoint = form.email === "support@ceynoa.com" 
        ? "http://localhost:8000/api/admin/login/" 
        : "http://localhost:8000/api/accounts/login/";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.error || "Invalid email or password");
        setLoading(false);
        return;
      }

     // Standardize user data structure (handles both normal and admin login responses)
      const userBase = data.user || { 
        username: data.username, 
        email: data.email, 
        is_staff: false 
      };
      
      const role = userBase.is_staff ? "admin" : "user";
      login(data.access, { ...userBase, role });

      setLoading(false);
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8000/api/accounts/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Google sign-in failed");
        return;
      }

      
      const userData = data.user || data; // Handle different backend structures
      const role = userData.is_staff ? "admin" : "user";
      

   const sessionUser = { ...userData, role };
      
      login(data.access, sessionUser);

      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google sign-in error");
    }
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Company Logo" className="company-logo" />

      <div className="left-side">
        <div className="auth-box">
          <h2 className="title">Sign in</h2>
          <h4 className="caption">Welcome back to Revolutie</h4>

          <form className="form" onSubmit={handleSubmit}>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
              placeholder="Email"
              className="input"
              required
            />

            <input
              name="password"
              value={form.password}
              onChange={onChange}
              type="password"
              placeholder="Password"
              className="input"
              required
            />

            {error && <div style={{ color: "salmon", marginBottom: 10 }}>{error}</div>}

            <button className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="or">___________________________or_____________________________</p>

          <div className="social">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Login Failed")}
            />
          </div>

          <p className="footer-text">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>

          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Support</a>
            <a href="#">Customer Care</a>
          </div>
        </div>

        <div className="right-side">
          <img src={myImage} alt="Side visual" />
        </div>
      </div>
    </div>
  );
}

export default Login;