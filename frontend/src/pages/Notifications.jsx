import React, { useState, useEffect } from "react";
import { X, Bell } from "lucide-react"; 

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from Django when the page loads
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token"); // Assuming you store your JWT here
      
      const response = await fetch("http://localhost:8000/api/accounts/notifications/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to mark a notification as read in the backend
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access");
      await fetch(`http://localhost:8000/api/accounts/notifications/${id}/read/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Update local state so UI reflects the change immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // When a user clicks a notification to open the modal
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    // If it's unread, trigger the API to mark it as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  // Function to close the modal
  const closeModal = () => setSelectedNotification(null);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            You have no notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification)} 
              className={`flex items-start p-6 border-b border-gray-100 last:border-0 hover:bg-orange-50 transition duration-150 ease-in-out cursor-pointer ${!notification.is_read ? 'bg-orange-50/40' : ''}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                <Bell size={24} />
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <h3 className={`text-base text-gray-800 ${!notification.is_read ? 'font-bold' : 'font-semibold'}`}>
                  {notification.title}
                  {/* Unread dot indicator */}
                  {!notification.is_read && (
                    <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1 pr-4 line-clamp-1">
                  {notification.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 ml-4">
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / Popup Overlay */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeModal} 
        >
          {/* Modal Content Box */}
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative transform transition-all"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            
            {/* Modal Header Icon */}
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-6 bg-orange-100 text-orange-500">
              <Bell size={28} />
            </div>
            
            {/* Modal Text content */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedNotification.title}
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-6">
              Received {new Date(selectedNotification.created_at).toLocaleString()}
            </p>
            
            <div className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 whitespace-pre-wrap">
              {selectedNotification.message}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}