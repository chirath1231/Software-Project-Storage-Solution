import React, { useState } from "react";

export default function RestoreAccount() {
  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/restore-account/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account restored successfully. You can now log in.");
        window.location.href = "/login";
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Error restoring account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-800 pb-11">
            Restore Account
          </h1>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-md p-10 border-l-4 border-orange-500">

            {/* Info */}
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-orange-500">
                Your account is scheduled for deletion. You can restore it within 30 days.
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-1">Enter your Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            {/* Button */}
            <button
              onClick={handleRestore}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-b from-orange-500 to-amber-400 text-white hover:opacity-90"
              }`}
            >
              {loading ? "Restoring..." : "Restore Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}