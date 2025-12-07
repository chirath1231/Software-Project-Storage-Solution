// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../auth.css";
import myImage from "../assets/tech.png";
import googleLogo from "../assets/plus.png"; // your Google logo
import logo from "../assets/logo.png"; // replace with your logo path



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
      navigate("/login"); // change as needed
    } catch (err) {
      setErrors({ non_field_errors: ["Network error"] });
      setLoading(false);
    }
  }

  return (
 
    
    <div className="auth-container">
       <img src={logo} alt="Company Logo" className="company-logo" />
      <div className="left-side">
      <div className="auth-box">
        <h2 className="title">Sign up</h2>
       <h4 className="caption">Sign up to enjoy the feature of Revolutie</h4>

        <form className="form" onSubmit={onSubmit}>
          <input name="username" value={form.username} onChange={onChange} type="text" placeholder="Username" className="input" />
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

          <button className="btn" disabled={loading}>
            {loading ? "Registering..." : "Sign up"}
          </button>
        </form>
        
        

        <p className="or">___________________________or_____________________________</p>

        <div className="social">
        <button className="social-btn">
          
          Continue with Google <img src={googleLogo} alt="Google" className="social-logo" />
        </button>
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
