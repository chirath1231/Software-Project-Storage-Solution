// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import myImage from "../assets/tech.png";
import logo from "../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  // Components state
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // NORMAL REGISTER Input Handler
  async function onSubmit(e) {
    e.preventDefault(); // Prevent form from refreshing page
    setErrors(null);

    if (form.password !== form.password2) {
      setErrors({ password: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try { 
      // Send registration data to backend
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
      // Tokens stored in localStorage
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
 

  return (
    <div className="relative flex">
      
      {/* Company Logo - absolute top left */}
      <img
        src={logo}
        alt="Company Logo"
        className="absolute top-5 left-5 w-[120px] h-auto z-10"
      />

      {/* Left Side */}
      <div className="flex flex-1 p-20  h-screen ">
        <div className="w-full max-w-[400px] bg-white p-5 ml-[120px] rounded-[8px] box-border">
          
          <h2 className="text-[32px] font-bold mb-5 text-left text-black">Sign up</h2>
          <h4 className="text-[15px] font-normal mb-5 text-left text-black">
            Sign up to enjoy the feature of Revolutie
          </h4>

          <form className="flex flex-col" onSubmit={onSubmit}>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              type="text"
              placeholder="Username"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
            />
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              type="email"
              placeholder="Email"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
            />
            <input
              name="first_name"
              required
              value={form.first_name}
              onChange={onChange}
              type="text"
              placeholder="First Name"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
            />
            <input
              name="last_name"
              required
              value={form.last_name}
              onChange={onChange}
              type="text"
              placeholder="Last Name"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
            />
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              type="password"
              placeholder="Password"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
            />
            <input
              name="password2"
              value={form.password2}
              onChange={onChange}
              type="password"
              placeholder="Confirm Password"
              className="w-full px-3 py-3 mb-3 rounded-[8px] border border-[#666] text-[#060606]"
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

            <button
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-[16px] font-bold rounded-[8px] cursor-pointer border-none transition-colors"
              disabled={loading}
            >
              {loading ? "Registering..." : "Sign up"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-[28px]">
            Already have an account?{" "}
            <Link to="/login" className="hover:underline">Sign in</Link>
          </p>

        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 justify-end overflow-hidden h-screen ">
        <img
          src={myImage}
          alt="Side visual"
          className="w-[100%] h-full object-cover"
        />
      </div>

    </div>
  );
}

export default Register;