// SubscriptionPage.jsx
import React, { useEffect, useState } from "react";
import buynow from "../assets/buy_now.png";

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [paidSubs, setPaidSubs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("username");

  useEffect(() => {
    const fetchPlans = fetch("http://127.0.0.1:8000/api/subscriptions/").then(
      (res) => res.json()
    );

    const fetchUserActive = userEmail
      ? fetch(
          `http://127.0.0.1:8000/api/subscriptions/user-subscriptions/${encodeURIComponent(
            userEmail
          )}/`
        ).then((res) => (res.ok ? res.json() : []))
      : Promise.resolve([]);

    Promise.all([fetchPlans, fetchUserActive])
      .then(([plans, userActive]) => {
        setSubscriptions(plans || []);
        const paidIds = new Set();
        (userActive || []).forEach((r) => {
          if (r.subscription_id) paidIds.add(Number(r.subscription_id));
        });
        setPaidSubs(paidIds);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        alert("Could not load subscriptions. See console for details.");
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

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
      const res = await fetch(
        "http://127.0.0.1:8000/api/subscriptions/create-payment/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription_id: sub.id,
            email: userEmail,
            amount: Number(sub.price).toFixed(2),
            first_name: userEmail.split("@")[0],
          }),
        }
      );

      const data = await res.json();
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

  return (
    <div className="px-6 py-10 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold mb-4 text-gray-800 text-center">Subscription Plans</h2>
      <p className="text-center text-gray-500 mb-10">
        Choose the plan that fits your needs
      </p>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {subscriptions.map((sub) => {
          const isPaid = paidSubs.has(sub.id);
          const isBest = sub.name === "Standard"; // Change plan for "Best Value" if needed

          return (
            <div
              key={sub.id}
              className={`bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between border ${
                isBest ? "border-orange-400" : "border-gray-200"
              } hover:scale-105 transition-transform`}
            >
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    sub.name === "Standard"
                      ? "bg-gray-200 text-gray-800"
                      : sub.name === "Plus"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {sub.name}
                </span>
                {isBest && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Best Value
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">Rs. {Number(sub.price).toFixed(2)}</h2>
              <p className="text-gray-500 mb-4">{sub.description}</p>

              <ul className="mb-6 space-y-2 text-gray-600 text-sm">
                {sub.features.map((feat, i) => (
                  <li key={i} className="flex items-center">
                    <span className="mr-2 text-green-500">✔</span> {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`flex items-center justify-center gap-2 font-semibold py-2 rounded-xl w-full text-white ${
                  isPaid
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : isBest
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-500 hover:bg-blue-600"
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