import React, { useEffect, useState } from "react";
import "../landing.css";
import buynow from "../assets/buy_now.png";

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED KEY
  const userEmail = localStorage.getItem("username");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/subscriptions/")
      .then((res) => res.json())
      .then((data) => setSubscriptions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (sub) => {
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
      alert("Payment error");
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h2 className="features-title">Pricing</h2>

      <div className="pricing-container">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="pricing-card">
            <span className="tag">{sub.name}</span>

            <h2>Rs. {Number(sub.price).toFixed(2)}</h2>
            <p>{sub.description}</p>

            <button className="buy-btn" onClick={() => handleSubscribe(sub)}>
              <img src={buynow} alt="buy" /> Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
