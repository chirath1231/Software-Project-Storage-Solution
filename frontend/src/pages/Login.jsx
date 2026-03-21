import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../auth.css";
import Maskgroup from "../assets/Maskgroup.png";
import Logo_on_Light from "../assets/Logo_on_Light.png";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ==========================
  // 🔐 NORMAL LOGIN
  // ==========================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/accounts/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data?.detail ||
            data?.non_field_errors ||
            "Invalid email or password"
        );
        setLoading(false);
        return;
      }

      // Save tokens
      if (rememberMe) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("username", data.username);
      } else {
        sessionStorage.setItem("access_token", data.access);
        sessionStorage.setItem("refresh_token", data.refresh);
        sessionStorage.setItem("username", data.username);
      }

      if (data.role === "admin") {
        // Redirect to admin dashboard
        navigate("/admin-dashboard");
        return;
      } else if (data.role === "user") {
        // Normal user
        login(data.access, data.username);
        navigate("/dashboard");
        return;
      } else {
        alert("Invalid login");
        setLoading(false);
        return;
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  // ==========================
  // 🔵 GOOGLE LOGIN
  // ==========================
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/accounts/google/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Google login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", data.username);

      login(data.access, data.username);
      navigate("/dashboard");
    } catch (error) {
      alert("Google login error");
    }

    setLoading(false);
  };

  // ==========================
  // UI
  // ==========================
  return (
    <div className="auth-container">
      <img
        src={Logo_on_Light}
        alt="Company Logo"
        className="company-logo"
      />

      <div className="left-side">
        <div className="auth-box">
          <h2 className="title">Sign in</h2>
          <h4 className="caption">
            Please login to continue to your account.
          </h4>

          <form className="form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="remember-area">
              <input
                type="checkbox"
                id="rememberMe"
                className="checkbox"
                checked={rememberMe}
                onChange={() =>
                  setRememberMe(!rememberMe)
                }
              />
              <label
                htmlFor="rememberMe"
                className="checkbox-label"
              >
                Keep me logged in
              </label>
            </div>

            <button
              className="btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="or">
            ___________________________or_____________________________
          </p>

          {/* GOOGLE BUTTON */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
            render={(renderProps) => (
              <button
                className="social-btn"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || loading}
              >
                Continue with Google
                <FcGoogle
                  size={20}
                  className="social-logo"
                />
              </button>
            )}
          />

          <p className="footer-text">
            Don’t have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </p>

          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Support</a>
            <a href="#">Customer Care</a>
          </div>
        </div>

        <div className="right-side">
          <img
            src={Maskgroup}
            alt="Side Visual"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
