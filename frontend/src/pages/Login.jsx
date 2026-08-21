import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "../auth.css";
import myImage from "../assets/tech.png";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function resolveRedirect(role) {
    return location.state?.from || (role === "admin" ? "/admin-dashboard" : "/dashboard");
  }

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
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data.detail || data.error || "Google login failed");
        return;
      }

      const userBase = data.user || { username: data.username, email: data.email, is_staff: false };
      const role = userBase.is_staff ? "admin" : "user";
      login(data.access, { ...userBase, role });
      navigate(resolveRedirect(role));
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data.detail || data.error || "Invalid email or password");
        return;
      }

      const userBase = data.user || { username: data.username, email: data.email, is_staff: false };
      const role = userBase.is_staff ? "admin" : "user";
      login(data.access, { ...userBase, role });
      navigate(resolveRedirect(role));
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
          <p className="caption">Please login to continue to your account.</p>

          <form className="form" onSubmit={handleSubmit}>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
              placeholder="Email"
              className="input-styled"
              required
            />
            <div style={{ position: "relative", width: "100%" }}>
              <input
                name="password"
                value={form.password}
                onChange={onChange}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-styled"
                required
                style={{ paddingRight: "45px" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "40%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <div style={{ color: "#d9534f", marginBottom: 12, fontSize: "14px", fontWeight: "500" }}>
                {error}
              </div>
            )}
            <button className="btn-orange" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="divider-container">
            <span className="divider-line"></span>
            <span className="divider-text">or</span>
            <span className="divider-line"></span>
          </div>

          <div className="social-google-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed. Please try again.")}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div className="auth-links-stacked">
            <p className="link-item">
              Don't have an account? <Link to="/register" className="highlight-link">Create account</Link>
            </p>
            <p className="link-item">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
            <p className="link-item">
              <Link to="/restore-account">Restore your account</Link>
            </p>
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
