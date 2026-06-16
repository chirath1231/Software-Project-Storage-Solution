// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // ✅ ADD
import "../auth.css";
import myImage from "../assets/tech.png";
import googleLogo from "../assets/plus.png";
import logo from "../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // 🔹 NORMAL REGISTER
  async function onSubmit(e) {
    e.preventDefault();
    setErrors(null);

    if (form.password !== form.password2) {
      setErrors({ password: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/accounts/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data);
        setLoading(false);
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ error: "Network error" });
      setLoading(false);
    }
  }

  // 🔵 GOOGLE REGISTER / LOGIN
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
        alert("Google signup failed");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data));

      navigate("/dashboard");
    } catch (error) {
      alert("Google signup error");
    }
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Company Logo" className="company-logo" />

      <div className="left-side">
        <div className="auth-box">
          <h2 className="title">Sign up</h2>
          <h4 className="caption">
            Sign up to enjoy the feature of Revolutie
          </h4>

          <form className="form" onSubmit={onSubmit}>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              type="text"
              placeholder="Username"
              className="input"
            />

            <input
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
              placeholder="Email / Phone"
              className="input"
            />

            <input
              name="password"
              value={form.password}
              onChange={onChange}
              type="password"
              placeholder="Password"
              className="input"
            />

            <input
              name="password2"
              value={form.password2}
              onChange={onChange}
              type="password"
              placeholder="Confirm Password"
              className="input"
            />

            {errors && (
              <div style={{ color: "salmon", marginBottom: 10 }}>
                {Object.entries(errors).map(([k, v]) => (
                  <div key={k}>
                    <strong>{k}:</strong>{" "}
                    {Array.isArray(v) ? v.join(", ") : v}
                  </div>
                ))}
              </div>
            )}

            <button className="btn" disabled={loading}>
              {loading ? "Registering..." : "Sign up"}
            </button>
          </form>

          <p className="or">
            ___________________________or_____________________________
          </p>

          {/* ✅ YOUR BUTTON – GOOGLE LOGIN ATTACHED */}
          <div className="social">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Login Failed")}
              render={(renderProps) => (
                <button
                  className="social-btn"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  Continue with Google
                  <img
                    src={googleLogo}
                    alt="Google"
                    className="social-logo"
                  />
                </button>
              )}
            />
          </div>

          <p className="footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
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

export default Register;
