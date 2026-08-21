import React, { useEffect, useState } from "react";
import buynow from "../assets/buy_now.png";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function SubscriptionPage() {
  const { user: authUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]); //Stores all available plans
  const [paidSubs, setPaidSubs] = useState(new Set()); // Stores already purchased subscription IDs
  const [loading, setLoading] = useState(true); // Controls loading screen
  const [currentPlan, setCurrentPlan] = useState(null);
  const [usedGB, setUsedGB] = useState(0);

  const userEmail = authUser?.email || authUser?.username || localStorage.getItem("email") || localStorage.getItem("username");
  const userId = authUser?.id || localStorage.getItem("user_id");

 useEffect(() => {
    setLoading(true);

    const fetchPlans = api.get("/api/subscriptions/").then((res) => res.data).catch(() => []);

    const fetchUserActive = userEmail
      ? api
          .get(`/api/subscriptions/user-subscriptions/${encodeURIComponent(userEmail)}/`)
          .then((res) => res.data)
          .catch(() => [])
      : Promise.resolve([]);

    const fetchUsedStorage = api.get("/api/files/").then((res) => res.data).catch(() => []);

    Promise.all([fetchPlans, fetchUserActive, fetchUsedStorage])
      .then(([plans, userActive, files]) => {
        setSubscriptions(plans || []);

        const paidIds = new Set();
        (userActive || []).forEach((r) => {
          if (r.subscription_id) paidIds.add(Number(r.subscription_id));
        });
        setPaidSubs(paidIds);

        // Get the plan with highest storage among active plans
        const highestPlan = (userActive || []).reduce((max, plan) => {
          return (plan.storage > (max?.storage || 0)) ? plan : max;
        }, null);
        setCurrentPlan(highestPlan);

        // Calculate used storage from files
        const totalBytes = (files || []).reduce(
          (sum, file) => sum + (file.size || 0),
          0
        );
        setUsedGB(totalBytes / 1024 / 1024 / 1024);

      })
      .catch((err) => {
        console.error("Fetch error:", err);
      })
      .finally(() => setLoading(false));

  }, [userEmail, userId, window.location.search]);

  const handleSubscribe = async (sub) => {
    if (paidSubs.has(sub.id)) {
      alert("You already own this plan.");
      return;
    }
    if (!userEmail) {
      alert("Please login first");
      return;
    }

    try {
      const res = await api.post("/api/subscriptions/create-payment/", {
        subscription_id: sub.id,
        email: userEmail,
        amount: Number(sub.price).toFixed(2),
        first_name: userEmail.split("@")[0],
      });

      const data = res.data;
      if (!data.success) return alert("Payment failed");

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      Object.entries(data.paymentData).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error");
    }
  };

  if (loading) return <h2 className="text-center mt-20 text-xl">Loading...</h2>;

  const totalGB = currentPlan?.storage || 5;
  const usedCapped = Math.min(usedGB, totalGB);
  const percentage = Math.min((usedGB / totalGB) * 100, 100);

  return (
    <div className="px-6 py-10 min-h-screen">
      {/* HEADER */}
      <div className="flex items-stretch gap-5 mb-10">
        <div className="w-2 bg-orange-500 rounded-md"></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Subscription</h1>
          <p className="text-gray-500 mt-2">
            Manage your plan, storage and billing preferences
          </p>
        </div>
      </div>

      {/* CURRENT PLAN STORAGE BAR */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-3 flex items-center gap-6 overflow-hidden relative">

      {/* Orange vertical line flush to left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
        {/* Left label + bar stacked */}
        <div className="flex-1 flex flex-col gap-2">
          <span className="text-xl font-bold text-gray-800">
            Current Plan
          </span>

          {/* Bar + percentage */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-700"
                style={{
                  width: `${percentage.toFixed(2)}%`,
                  background: "linear-gradient(to right, #f97316, #fb923c)",
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* GB display */}
        <div className="whitespace-nowrap">
          <div className="whitespace-nowrap">
            <span className="text-3xl font-bold text-gray-800">
              {usedGB < 1
                ? `${(usedGB * 1024).toFixed(0)}MB`
                : `${usedCapped.toFixed(2)}GB`}
            </span>

            <span className="text-base text-gray-400 font-medium">
              /{totalGB}GB
            </span>
          </div>
        </div>

        {/* Upgrade button */}
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-full text-sm transition whitespace-nowrap"
          onClick={() =>
            document
              .getElementById("plans-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          Upgrade Plan
        </button>
      </div>

      <p className="text-gray-500 mb-10">
        The storage bar will start to update once you reach 1 GB
      </p>

      {/* PLANS GRID */}
      <div id="plans-section" className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {subscriptions.map((sub) => {
          const isPaid = paidSubs.has(sub.id);
          const isBest = sub.name === "Standard";

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between border border-gray-200 transition-all duration-300 cursor-pointer
                hover:border-orange-400 hover:shadow-[0_8px_30px_rgba(249,115,22,0.35)] hover:scale-105 hover:z-10 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-500">
                  {sub.name}
                </span>
                {isBest && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Best Value
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                Rs. {Number(sub.price).toFixed(2)}
              </h2>
              <p className="text-gray-500 mb-4">{sub.description}</p>

              <ul className="mb-6 space-y-2 text-gray-600 text-sm">
                {sub.features.map((feat, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-2 text-orange-500">✔️</span> {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`flex items-center justify-center gap-2 font-semibold py-2 rounded-xl w-full text-white ${
                  isPaid
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-orange-500 hover:bg-orange-600"
                } transition-colors`}
                onClick={() => handleSubscribe(sub)}
                disabled={isPaid}
              >
                <img src={buynow} alt="buy" className="w-5" />
                {isPaid ? "Subscribed" : "Subscribe Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}