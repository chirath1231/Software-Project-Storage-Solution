import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext"; 

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [user, setUser] = useState(null);
  const [storage, setStorage] = useState({
    used: 0,
    total: 100,
  });


useEffect(() => {
  // Fetch profile
  api.get("/api/accounts/profile/")
    .then((res) => {
      setUser(res.data);
      if (res.data.profile_picture) {
        setProfilePicURL(res.data.profile_picture);
      }
    })
    .catch((err) => console.error("Error fetching profile:", err));

  // Fetch actual files to calculate real storage 
  const userEmail = localStorage.getItem("username");

  Promise.all([
    api.get("/api/files/").then(res => res.data).catch(() => []),
    userEmail
      ? fetch(`http://127.0.0.1:8000/api/subscriptions/user-subscriptions/${encodeURIComponent(userEmail)}/`)
          .then(res => res.ok ? res.json() : [])
      : Promise.resolve([])
  ]).then(([files, userActive]) => {
    // Calculate used GB from files
    const totalBytes = (files || []).reduce((sum, file) => sum + (file.size || 0), 0);
    const usedGB = totalBytes / 1024 / 1024 / 1024;

    // Get total GB from highest active plan
    const highestPlan = (userActive || []).reduce((max, plan) => {
      return (plan.storage > (max?.storage || 0)) ? plan : max;
    }, null);
    const totalGB = highestPlan?.storage || 5;

    setStorage({ used: usedGB, total: totalGB });
  });
}, []);

const percentage = Math.min((storage.used / storage.total) * 100, 100);
const safePercentage = percentage; 

  if (!user) return <p>Loading...</p>;
  return (
    <div className="flex min-h-screen">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <div className="p-6">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-800 pb-11">
            My Profile
          </h1>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-10 border-l-4 mb-6 border-orange-500">
            {/* Top Section - Profile */}
            <div className="flex flex-col items-center border-r pr-4">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {profilePicURL ? (
                  <img
                    src={profilePicURL.startsWith("/media") ? `http://localhost:8000${profilePicURL}` : profilePicURL}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-3xl">
                    👤
                  </div>
                )}
              </div>

              <h2 className="mt-4 font-semibold text-2xl">{user.username}</h2>
              <p className="text-gray-500 text-lg">{user.first_name} {user.last_name}</p> 
              <p className="text-gray-500 text-lg">Country: {user.state}</p> 

              <button 
              onClick={() => navigate("/dashboard/profile-settings")}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-12 border-l-4 mb-6 border-orange-500">
            {/* Middle Section - Contact */}
            <div className="border-r pr-4 ">
              <h3 className="font-semibold text-gray-700 text-xl mb-2">Contact</h3>
              <p className=" text-gray-600">Email: {user.email}</p>
              <p className=" text-gray-600">Phone: {user.contact_number}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-12 border-l-4 mb-6 border-orange-500">
  
            <div>
              <h3 className="font-semibold text-gray-700 text-xl mb-2">
                Storage Usage
              </h3>

              {/* BAR */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700"
                  style={{
                    width: `${safePercentage}%`,
                    background: "linear-gradient(to right, #f97316, #fb923c)",
                  }}
                />
              </div>

              {/* TEXT */}
              <div className="flex justify-between mt-2">
                <p className="text-gray-500">
                  {safePercentage.toFixed(0)}% used
                </p>

                <p className="text-gray-500">
                  {storage.used.toFixed(2)}GB / {storage.total}GB
                </p>
              </div>

              <button
                className="mt-4 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white"
                onClick={() => navigate("/dashboard/subscription")}
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 flex justify-between">
            <button className="px-12 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white"
            onClick={() => navigate("/dashboard/settings")}>
              Settings
            </button>

            <button className="px-12 py-2 bg-gradient-to-b from-orange-500 to-amber-400 text-white rounded-lg"
            onClick={() => {
              logout();         // call logout function from AuthContext
              navigate("/login"); // redirect to login page
            }}>
              Log out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
