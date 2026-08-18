import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); 
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/accounts/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.detail || "OTP sent to your email!");

         // Redirect to Reset Password page after 1.5s and pass email
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 500);

      } else {
        setError(data.detail || "Something went wrong.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Enter your registered email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          placeholder="email@example.com"
        />
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
        >
          Send OTP
        </button>
      </form>
      {message && <p className="text-green-500 mt-3">{message}</p>}
      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}