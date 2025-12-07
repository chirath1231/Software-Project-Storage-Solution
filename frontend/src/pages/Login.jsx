// src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "../auth.css";
import Maskgroup from "../assets/Maskgroup.png";
import Logo_on_Light from "../assets/Logo_on_Light.png";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/accounts/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login Successful!");

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      window.location.href = "/";
    } else {
      alert(data?.detail || data?.non_field_errors || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <img src={Logo_on_Light} alt="Company Logo" className="company-logo" />

      <div className="left-side">
        <div className="auth-box">
          <h2 className="title">Sign in</h2>
          <h4 className="caption">Please login to continue to your account.</h4>

          <form className="form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="input"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="remember-area">
              <input type="checkbox" id="rememberMe" className="checkbox" />
              <label htmlFor="rememberMe" className="checkbox-label">
                Keep me logged in
              </label>
            </div>

            <button className="btn">Sign in</button>
          </form>

          <p className="or">
            ___________________________or_____________________________
          </p>

          <button className="social-btn">
            Sign in with Google <FcGoogle size={20} className="social-logo" />
          </button>

          <p className="footer-text">
            Don’t have an account? <Link to="/register">Create account</Link>
          </p>

          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Support</a>
            <a href="#">Customer Care</a>
          </div>
        </div>

      <div className="right-side">
        <img src={Maskgroup} alt="Side Visual" />
              </div>
      </div>
    </div>
  );
}

export default Login;
