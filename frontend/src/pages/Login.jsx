import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../auth.css";
import Maskgroup from "../assets/Maskgroup.png";
import Logo_on_Light from "../assets/Logo_on_Light.png";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";
import {jwtDecode} from "jwt-decode";  


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

        // CASE 1: Account scheduled for deletion
        if (data.error?.includes("scheduled for deletion")) {
          localStorage.setItem("userEmail", email); // save email for restore
          alert(data.error);

          navigate("/restore-account"); // 👉 redirect
          setLoading(false);
          return;
        }

        // CASE 2: Inactive account
        if (data.error?.includes("deactivated")) {
          alert(data.error);
          setLoading(false);
          return;
        }

        // CASE 3: Other errors
        alert(
          data?.error ||
          data?.detail ||
          data?.non_field_errors ||
          "Invalid email or password"
        );

        setLoading(false);
        return;
      }

      // ONLY STORE AFTER SUCCESS
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userEmail", email);

    login(data.access, {
      username: data.username,
      email: data.email
    }, rememberMe);      
    navigate("/dashboard");

    } catch (error) {
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  // ==========================
  // 🔵 GOOGLE LOGIN
  // ==========================
  // const handleGoogleSuccess = async (credentialResponse) => {
  //   setLoading(true);

  //   try {
  //     const res = await fetch(
  //       "http://localhost:8000/api/accounts/google/",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           token: credentialResponse.credential,
  //         }),
  //       }
  //     );

  //     const data = await res.json();
  //     // localStorage.setItem("user_id", data.user.id);

  //     if (!res.ok) {
  //       alert("Google login failed");
  //       setLoading(false);
  //       return;
  //     }

  //     localStorage.setItem("access_token", data.access);
  //     localStorage.setItem("refresh_token", data.refresh);
  //     localStorage.setItem("username", data.username);

  //    login(data.access, {
        //   username: data.username,
        //   email: data.email
        // }, true);
  //     navigate("/dashboard");
  //   } catch (error) {
  //     alert("Google login error");
  //   }

  //   setLoading(false);
  // };


  const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true);

  try {
    console.log("Google credentialResponse:", credentialResponse);

    if (!credentialResponse?.credential) {
      alert("Google did not return a credential. Try again.");
      setLoading(false);
      return;
    }

     // Decode the JWT token to inspect it
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Decoded Google token:", decoded);

    /**
     * Important fields:
     * decoded.email        → the email Google issued this token for
     * decoded.aud          → the client ID this token is for
     * decoded.exp          → token expiration timestamp
     * decoded.iss          → issuer (should be accounts.google.com)
     */

    // OPTIONAL: quick check if token matches your frontend client ID
    if (decoded.aud !== process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      alert(
        `Token client ID mismatch!\nToken is for: ${decoded.aud}\nExpected: ${process.env.REACT_APP_GOOGLE_CLIENT_ID}`
      );
      setLoading(false);
      return;
    }

    const res = await fetch("http://localhost:8000/api/accounts/google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: credentialResponse.credential,
      }),
    });
 
    const data = await res.json();
    console.log("Backend response:", data);

    if (!res.ok) {
      alert("Google login failed: " + (data?.detail || JSON.stringify(data)));
      setLoading(false);
      return;
    }

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("username", data.username);
    localStorage.setItem("user_id", data.user.id);

    login(data.access, data.username, true);
    navigate("/dashboard");
  } catch (error) {
    console.error("Google login error:", error);
    alert("Google login error. See console.");
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

            <button
              className="btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-400 font-medium">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          

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
            <Link to="/register" className="hover:underline">
              Create account
            </Link>
          </p>

          <div className="footer-text flex flex-col gap-2">
            <button
              className="hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>

            <button
              className="hover:underline "
              onClick={() => navigate("/restore-account")}
            >
              Restore your account
            </button>
          </div>

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
