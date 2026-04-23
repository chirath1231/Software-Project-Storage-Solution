import React, { useState } from "react";
import { X, Bell } from "lucide-react"; 
import EventCalendar from "../components/EventCalendar"; 

// --- 1. IMPORT THE GLOBAL BRAIN ---
import { useNotifications } from '../context/NotificationContext';

export default function Notifications() {
  // --- 2. PULL DATA DIRECTLY FROM CONTEXT (No local fetching needed!) ---
  const { notifications, fetchGlobalNotifications } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Function to mark a notification as read in the backend
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Note: If you still get a 404 here, change 'accounts' to 'auth' in this URL!
      await fetch(`http://localhost:8000/api/accounts/notifications/${id}/read/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // --- 3. TELL THE GLOBAL BRAIN TO UPDATE EVERYWHERE ---
      fetchGlobalNotifications();
      
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // When a user clicks a notification to open the modal
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const closeModal = () => setSelectedNotification(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
      {/* Header Section */}
      <div className="mb-8 border-l-4 border-orange-500 pl-4">
        <h1 className="text-3xl font-bold text-gray-800">Command Center</h1>
        <p className="text-gray-500 mt-1 text-lg">
          Manage your alerts and upcoming schedule
        </p>
      </div>

      {/* Main Grid Layout: Notifications on Left, Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Notifications */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Alerts</h2>
            {/* Sort Dropdown */}
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

          {/* Notifications List (Now using global data) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {(!notifications || notifications.length === 0) ? (
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
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                    <Bell size={24} />
                  </div>

                  <div className="ml-4 flex-1">
                    <h3 className={`text-base text-gray-800 ${!notification.is_read ? 'font-bold' : 'font-semibold'}`}>
                      {notification.title}
                      {!notification.is_read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 pr-4 line-clamp-1">
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Calendar Component */}
        <div>
          {/* Calendar already calls fetchGlobalNotifications internally, so we don't need to pass it anymore! */}
          <EventCalendar />
        </div>

      </div>

      {/* Modal / Popup Overlay */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeModal} 
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative transform transition-all"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-6 bg-orange-100 text-orange-500">
              <Bell size={28} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedNotification.title}
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-6">
              Received {new Date(selectedNotification.created_at).toLocaleString()}
            </p>
            
            <div className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 whitespace-pre-wrap">
              {selectedNotification.message}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-orange-400"
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