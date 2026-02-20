import React from "react";


// Mock data for notifications based on your UI design
const notificationsData = [
  {
    id: 1,
    title: "Update: New Features Added to Your Account!",
    description: "Exciting news! We've rolled out new features to enhance your experience. Log in to explore what's new!",
    time: "Just now",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Friendly Tip: Optimize Your Workspace",
    description: "Just a heads-up that your rent payment is due soon. Please make sure to pay on time to avoid any late fees!",
    time: "7 hours ago",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "System Notification: Security Check Scheduled",
    description: "For your safety, a system security check is planned for Thursday at 2:00 PM. No action needed on your part; we'll handle everything!",
    time: "Yesterday",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Quick Reminder: Weekly Goal Check-In",
    description: "Take a moment to review your goals for this week. You're doing great - keep up the momentum!",
    time: "20 Sep",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Heads Up: Free Webinar Tomorrow",
    description: "Join us for a live webinar on Artificial Intelligence! Don't miss out on valuable insights and Q&A with our experts. Register now!",
    time: "20 Sep",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function Notifications() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* Header Section */}
      <div className="mb-8 border-l-4 border-orange-500 pl-4">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-500 mt-1 text-lg">
          Stay updated with your file activity, sharing, and account alerts
        </p>
      </div>

      {/* Sort Dropdown */}
      <div className="mb-6">
        <div className="inline-block relative">
          <select className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer">
            <option>Sort By</option>
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Unread</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notificationsData.map((notification) => (
          <div 
            key={notification.id} 
            className="flex items-start p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl ${notification.iconBg} ${notification.iconColor}`}>
              {notification.icon}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-800">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 pr-4">
                {notification.description}
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 ml-4">
              <span className="text-sm text-gray-400 whitespace-nowrap">
                {notification.time}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}