import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [count, setCount] = useState(5);
  
  // Optional Context Support (Safe Fallback if missing during merge)
  const notificationContext = useNotifications();
  const fetchGlobalNotifications = notificationContext?.fetchGlobalNotifications;

  // Get the order_id from the URL to show the user
  const orderId = searchParams.get("order_id");

  // 1. Fetch notifications shortly after landing to ensure the webhook has processed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof fetchGlobalNotifications === "function") {
        fetchGlobalNotifications();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [fetchGlobalNotifications]);

  // 2. Auto redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard/subscription");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl px-12 py-14 flex flex-col items-center text-center max-w-md w-full mx-4 relative overflow-hidden">

        {/* Top orange bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-3xl" />

        {/* Success icon */}
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-extrabold text-gray-800 mb-2"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Payment Successful!
        </h1>

        {/* Display the Order ID nicely if it exists */}
        {orderId && (
          <p className="text-xs font-mono text-gray-400 mb-4 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            Receipt ID: {orderId}
          </p>
        )}

        {/* Subtitle */}
        <p className="text-gray-500 text-base mb-8 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Thank you for subscribing. Your account has been upgraded and your new storage features are now active immediately.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mb-6" />

        {/* Auto redirect notice */}
        <p className="text-sm text-gray-400 mb-6">
          Redirecting to your subscription page in{" "}
          <span className="text-orange-500 font-bold">{count}s</span>
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate("/dashboard/subscription")}
            className="w-full py-3 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 shadow-md"
            style={{ background: "linear-gradient(to right, #f97316, #fb923c)" }}
          >
            View My Plan
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl text-orange-500 font-bold text-base border-2 border-orange-400 hover:bg-orange-50 transition-all shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
        
      </div>
    </div>
  );
}