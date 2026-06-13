import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  //  NORMAL LOGIN
  // ==========================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Send credentials to backend
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

          navigate("/restore-account"); // redirect
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
  //  GOOGLE LOGIN
  // ==========================
  const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true);

  try {
    if (!credentialResponse?.credential) {
      alert("Google did not return a credential. Try again.");
      setLoading(false);
      return;
    }

     // Decode the JWT token to inspect it
    const decoded = jwtDecode(credentialResponse.credential);

    /**
     * Important fields:
     * decoded.email        → the email Google issued this token for
     * decoded.aud          → the client ID this token is for
     * decoded.exp          → token expiration timestamp
     * decoded.iss          → issuer (should be accounts.google.com)
     */

    // Security Step: quick check if token matches your frontend client ID
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

    if (!res.ok) {
      alert("Google login failed: " + (data?.detail || JSON.stringify(data)));
      setLoading(false);
      return;
    }

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("username", data.username);
    // localStorage.setItem("user_id", data.user.id);

  login(data.access, {
    username: data.username,
    email: data.email
  }, true);
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
    <div className="relative flex">
      
      {/* Company Logo */}
      <img
        src={Logo_on_Light}
        alt="Company Logo"
        className="absolute top-5 left-5 w-[120px] h-auto z-10"
      />

      {/* Left Side */}
      <div className="flex flex-1 p-20 h-screen">
        <div className="w-full max-w-[400px] bg-white p-5 ml-[120px] rounded-[8px] box-border">

          <h2 className="text-[32px] font-bold mb-5 text-left text-black">Sign in</h2>
          <h4 className="text-[15px] font-normal mb-5 text-left text-black">
            Please login to continue to your account.
          </h4>

          <form className="flex flex-col" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-[16px] font-bold rounded-[8px] cursor-pointer border-none transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-gray-400 font-medium">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Google Login */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
            render={(renderProps) => (
              <button
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold rounded-[8px] border border-[#ccc] cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || loading}
              >
                Continue with Google
                <FcGoogle size={20} />
              </button>
            )}
          />

          {/* Footer Text */}
          <p className="text-center mt-[18px]">
            Don't have an account?{" "}
            <Link to="/register" className="hover:underline">
              Create account
            </Link>
          </p>

          <div className="text-center mt-[18px] flex flex-col gap-2">
            <button
              className="hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
            <button
              className="hover:underline"
              onClick={() => navigate("/restore-account")}
            >
              Restore your account
            </button>
          </div>

          {/* Footer Links */}
          <div className="flex justify-between mt-3 text-[12px] opacity-80">
            <a href="#" className="text-white no-underline">Terms</a>
            <a href="#" className="text-white no-underline">Support</a>
            <a href="#" className="text-white no-underline">Customer Care</a>
          </div>

        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 justify-end overflow-hidden h-screen">
        <img
          src={Maskgroup}
          alt="Side Visual"
          className="w-[100%] h-full object-cover"
        />
      </div>

    </div>
  );
}

export default Login;