import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function DashboardSettings() {
  const navigate = useNavigate();

  const settingsItems = [
    { name: "Profile Settings", path: "/dashboard/profile-settings" },
    { name: "Security", path: "/dashboard/security" },
    { name: "Notifications", path: "/dashboard/notifications" },
    { name: "Privacy", path: "/dashboard/privacy" },
    { name: "Ticket Submission", path: "/dashboard/ticket-submission" },
    { name: "Delete Account", path: "/dashboard/delete-account" },
  ];

  return (
    <div className="p-10 min-h-screen">

      {/* HEADER */}
      <div className="flex items-stretch gap-5 mb-10">
        <div className="w-2 bg-orange-500 rounded-md"></div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Settings
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your account, privacy, and system preferences
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="max-w-3xl space-y-4">
        {settingsItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="
              flex items-stretch
              bg-white rounded-2xl shadow-md
              cursor-pointer overflow-hidden
              transition-all duration-300
              hover:shadow-lg hover:scale-[1.01]
            "
          >
            <div className="w-1.5 bg-orange-500"></div>

            <div className="flex justify-between items-center w-full px-6 py-4">
              <span className="text-gray-700 font-semibold text-base">
                {item.name}
              </span>

              <ArrowRight size={20} className="text-black" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}