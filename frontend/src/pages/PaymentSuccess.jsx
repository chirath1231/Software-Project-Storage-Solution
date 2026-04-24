import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

// --- 1. IMPORT THE GLOBAL BRAIN ---
import { useNotifications } from "../context/NotificationContext";

export default function PaymentSuccess() {
  // --- 2. HOOK INTO THE CONTEXT ---
  const { fetchGlobalNotifications } = useNotifications();

  useEffect(() => {
    // --- 3. TRIGGER REFRESH WHEN THEY LAND ON THIS PAGE ---
    // Because Django just created the notification in the background,
    // this will fetch it and light up the bell instantly!
    fetchGlobalNotifications();
  }, []); // Empty dependency array ensures this only runs once when the page loads

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100 transform transition-all hover:scale-105 duration-300">
        
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you for subscribing. Your account has been upgraded and your new features are now unlocked.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            to="/dashboard"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/dashboard/subscription"
            className="w-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-bold py-3 px-6 rounded-xl shadow-sm transition-colors"
          >
            View My Plan
          </Link>
        </div>
        
      </div>
    </div>
  );
}