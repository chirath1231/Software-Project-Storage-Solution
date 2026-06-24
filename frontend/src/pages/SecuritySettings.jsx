import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SecuritySettings() {
  const navigate = useNavigate();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Mock connected devices (replace with API later)
  const [devices] = useState([
    {
      id: 1,
      name: "Chrome - Windows",
      location: "Colombo, Sri Lanka",
      lastActive: "Active now",
    },
    {
      id: 2,
      name: "Safari - iPhone",
      location: "Matara, Sri Lanka",
      lastActive: "2 hours ago",
    },
  ]);

  const handleChangePassword = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
        const token = localStorage.getItem("access_token");

        const res = await fetch("http://localhost:8000/api/accounts/change-password/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
        }),
        });

        const data = await res.json();

        if (!res.ok) {
        setErrorMsg(data.error || "Password change failed");
        setLoading(false);
        return;
        }

        setSuccessMsg("Password changed successfully!");

        setCurrentPassword("");
        setNewPassword("");
    } catch (error) {
        setErrorMsg("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-10">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-10">
        Security Settings
      </h1>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">

        {/* Change Password */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Change Password
          </h2>

          <input
            type="password"
            placeholder="Current Password"
            className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition mb-4"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
                {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                {errorMsg}
            </div>
          )}
        </div>

        {/* Connected Devices */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Connected Devices
          </h2>
          <button
            onClick={() => window.open("https://your-app-link.com", "_blank")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-lg font-semibold hover:scale-105 transition mb-6"
            >
            Download Mobile App
          </button>

          {/* <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-3 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {device.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {device.location}
                  </p>
                  <p className="text-xs text-gray-400">
                    {device.lastActive}
                  </p>
                </div>

                <button className="text-sm text-red-500 hover:underline">
                  Logout
                </button>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/*  Restore Account Button */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Account Recovery
          </h2>
          <p className="text-sm text-gray-500">
            Restore your account if it was deleted or deactivated.
          </p>
        </div>

        <button
          onClick={() => navigate("/restore-account")}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          Restore Account
        </button>
      </div>
    </div>
  );
}