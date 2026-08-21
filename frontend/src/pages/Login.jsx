import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "../auth.css";
import myImage from "../assets/tech.png";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ✅ FIX: handleGoogleSuccess was referenced but never defined
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      let data = {};
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        setError(data.detail || data.error || "Google login failed");
        return;
      }

      const userBase = data.user || { username: data.username, email: data.email, is_staff: false };
      const role = userBase.is_staff ? "admin" : "user";
      login(data.access, { ...userBase, role });
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Outer try/catch handles network-level errors (e.g. server down, CORS, no internet).
 // Inner try/catch silently guards against non-JSON responses to prevent a parse crash.
// HTTP errors (4xx/5xx) are handled separately via `res.ok` since fetch() doesn't throw on them.
// `finally` ensures the loading state is always cleared regardless of outcome.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const checkAdminRes = await fetch(`${API_BASE_URL}/api/check-admin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      const checkAdminData = await checkAdminRes.json();

      const endpoint = checkAdminData.is_admin
        ? `${API_BASE_URL}/api/admin/login/`
        : `${API_BASE_URL}/api/accounts/login/`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      let data = {};
      try { data = await res.json(); } catch { data = {}; }console.log("ACCESS TOKEN:", data.access);

      if (!res.ok) {
        setError(data.detail || data.error || "Invalid email or password");
        return;
      }

      const userBase = data.user || { username: data.username, email: data.email, is_staff: false };
      const role = userBase.is_staff ? "admin" : "user";
      login(data.access, { ...userBase, role });
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
           <div style={{ position: "relative", width: "100%" }}>
              <input
                name="password"
                value={form.password}
                onChange={onChange}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input"
                required
                style={{ paddingRight: "45px" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <div style={{ color: "salmon", marginBottom: 10 }}>{error}</div>}
            <button className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="or">___________________________or_____________________________</p>

          <div className="social">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed. Please try again.")}
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