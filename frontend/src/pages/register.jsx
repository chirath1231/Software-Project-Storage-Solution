// src/pages/Register.jsx
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "../auth.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../auth.css";
import { FcGoogle } from "react-icons/fc";
import Maskgroup from "../assets/Maskgroup.png"; 
import Logo_on_Light from "../assets/Logo_on_Light.png";

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

  async function onSubmit(e) {
    e.preventDefault();
    setErrors(null);

    if (form.password !== form.password2) {
      setErrors({ password: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        credentials: "include", // optional
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          password2: form.password2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data);
        setLoading(false);
        return;
      }

      // Save tokens to localStorage (or cookie) - decide per security needs
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Optionally store user info
      localStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);

      // redirect to dashboard or home
      navigate("/dashboard"); // change as needed
    } catch (err) {
      setErrors({ non_field_errors: ["Network error"] });
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth">
        <div className="logo">
          <img src={Logo_on_Light} alt="logo" />
        </div>
        <div className="auth-content">
          <h2 className="title">Register</h2>
          <p className="para">Sign up to enjoy the feature of Revolutie</p>

          <form className="form" onSubmit={onSubmit}>
            <input name="username" value={form.username} onChange={onChange} type="text" placeholder="Username" className="input" />
            {/* <input name="dob" value={form.dob} onChange={onChange} type="date" placeholder="Date of Birth" className="input" /> */}
            <input name="email" value={form.email} onChange={onChange} type="email" placeholder="Email / Phone" className="input" />
            <input name="password" value={form.password} onChange={onChange} type="password" placeholder="Password" className="input" />
            <input name="password2" value={form.password2} onChange={onChange} type="password" placeholder="Confirm Password" className="input" />

            {errors && (
              <div style={{ color: "salmon", marginBottom: 10 }}>
                {Object.entries(errors).map(([k, v]) => (
                  <div key={k}><strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : v}</div>
                ))}
              </div>
            )}
          </form>

          <button className="gradient-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          

          <div className="divider">
            <span>or</span>
          </div>

          <button className="google-btn">
            Sign in with Google
            <FcGoogle size={20} />
          </button>

          <p className="footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
        <div className="auth-image">
          <img src={Maskgroup} alt="maskgroup" />
        </div>
      </div>
    </div>
  );
}

export default Register;
