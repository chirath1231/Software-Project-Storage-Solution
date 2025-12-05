import { useState } from "react";
import { Link } from "react-router-dom";
import "../auth.css";
import { FcGoogle } from "react-icons/fc";
import Maskgroup from "../assets/Maskgroup.png"; 
import Logo_on_Light from "../assets/Logo_on_Light.png";


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
      <div className="logo-area">
        <div className="logo">
          <img src={Logo_on_Light} alt="logo" />
        </div>
      </div>
      
      <div className="auth">
        <div className="auth-content">
          
            <h2 className="title">Sign in</h2>
            <p className="para">Please login to continue to your account.</p>

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
              
              <input 
                type="checkbox" 
                id="rememberMe" 
                className="checkbox"
              />
              <label className="checkbox-label">Keep me logged in</label>
            </form>

            <button className="gradient-btn">Sign in</button>


            <div className="divider">
              <span>or</span>
            </div>

            <button className="google-btn">
              Sign in with Google
              <FcGoogle size={20} />
            </button>

            <p className="footer-text">
              Don’t have an account? <Link to="/register">Create account</Link>
            </p>
          </div>
          <div className="auth-image">
            <img src={Maskgroup} alt="maskgroup" />
          </div>
      </div>
    </div>
    
  );
}

export default Login;
