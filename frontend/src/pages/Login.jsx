import { useState } from "react";
import { Link } from "react-router-dom";
import "../auth.css";

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
     localStorage.setItem("userEmail", data.email);

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      window.location.href = "/subscription";
    } else {
      alert(data?.detail || data?.non_field_errors || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="title">Login</h2>

        <form className="form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email / Phone"
            className="input"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn">Login</button>
        </form>

        <p className="footer-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
