import React, { useState } from "react";

export default function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
      alert("Please confirm deletion");
      return;
    }

    if (!password) {
      alert("Enter your password");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch("http://localhost:8000/api/accounts/delete-account/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        alert("Account scheduled for deletion");

        localStorage.clear();
        window.location.href = "/login";
      } else {
        const data = await res.json();
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      alert("Error deleting account");
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
                    Delete Account
                </h1>
        
                <div className="bg-white rounded-xl shadow-md p-10 border-l-4 border-orange-500 mb-6">

                    {/* Warning */}
                    <div className="bg-red-50 border border-orange-200 p-4 rounded-lg mb-6">
                        <p className="text-sm text-orange-500">
                        ⚠️ This action cannot be undone. Your account will be deactivated and
                        permanently deleted after 30 days. All your files, photos, and data
                        will be removed from our cloud storage.
                        </p>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Enter Password</label>
                        <input
                        type="password"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        autoComplete="new-password"
                        />
                    </div>

                    {/* Confirm */}
                    <div className="flex items-center gap-2 mb-6">
                        <input
                        type="checkbox"
                        checked={confirm}
                        onChange={() => setConfirm(!confirm)}
                        />
                        <label className="text-gray-600 text-sm">
                        I understand that my account will be deleted permanently
                        </label>
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                        {loading ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}