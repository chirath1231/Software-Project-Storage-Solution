import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AdminSettings() {
  const navigate = useNavigate();

  const settingsItems = [
    { name: "System Configuration", description: "Manage global system settings.", path: "/admin/settings/system" },
    { name: "Security", description: "Configure security policies, 2FA, and audit logs.", path: "/admin/settings/security" },
    { name: "API & Integrations", description: "Manage API keys and third-party integrations.", path: "/admin/settings/integrations" },
    { name: "Email Templates", description: "Customize automated emails sent to users.", path: "/admin/settings/email" },
    { name: "Subscription Plans", description: "Create and manage subscription tiers and pricing.", path: "/admin/settings/plans" },
    { name: "Maintenance Mode", description: "Enable or disable maintenance mode for the site.", path: "/admin/settings/maintenance" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin <span className="text-orange-500">Settings</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Configure and manage the application's core settings.
        </p>
      </div>

      <div className="max-w-4xl space-y-4">
        {settingsItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="
              flex items-center justify-between
              bg-white rounded-xl shadow-md p-6
              cursor-pointer transition-all duration-300
              hover:shadow-lg hover:border-orange-500 border-l-4 border-transparent
            "
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            </div>
            <ArrowRight size={20} className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}