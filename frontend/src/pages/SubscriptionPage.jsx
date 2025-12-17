// SubscriptionPage.jsx
import React, { useEffect, useState } from "react";
import "../landing.css";
import buynow from "../assets/buy_now.png";

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [paidSubs, setPaidSubs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("username"); // stays as you had it

  useEffect(() => {
    // Fetch both subscriptions and user's active subscriptions (if logged in)
    const fetchPlans = fetch("http://127.0.0.1:8000/api/subscriptions/").then(
      (res) => res.json()
    );

    const fetchUserActive = userEmail
      ? fetch(
          `http://127.0.0.1:8000/api/subscriptions/user-subscriptions/${encodeURIComponent(
            userEmail
          )}/`
        ).then((res) => {
          if (!res.ok) return [];
          return res.json();
        })
      : Promise.resolve([]);

    Promise.all([fetchPlans, fetchUserActive])
      .then(([plans, userActive]) => {
        setSubscriptions(plans || []);

        // Build a set of subscription IDs the user has paid
        const paidIds = new Set();
        (userActive || []).forEach((r) => {
          // r.subscription_id returned by backend (see views.py change)
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

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h2 className="features-title">Pricing</h2>

      <div className="pricing-container">
        {subscriptions.map((sub) => {
          const isPaid = paidSubs.has(sub.id);
          return (
            <div key={sub.id} className="pricing-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="tag">{sub.name}</span>
                {isPaid ? (
                  <span
                    style={{
                      background: "#2ecc71",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                    }}
                  >
                    PAID
                  </span>
                ) : null}
              </div>

              <h2>Rs. {Number(sub.price).toFixed(2)}</h2>
              <p>{sub.description}</p>

              <button
                className="buy-btn"
                onClick={() => handleSubscribe(sub)}
                disabled={isPaid}
                style={{
                  opacity: isPaid ? 0.6 : 1,
                  cursor: isPaid ? "not-allowed" : "pointer",
                }}
              >
                <img src={buynow} alt="buy" style={{ width: 22, marginRight: 8 }} />
                {isPaid ? "Subscribed" : "Subscribe Now"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
