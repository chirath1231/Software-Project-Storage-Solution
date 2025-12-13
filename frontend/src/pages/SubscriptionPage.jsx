import React, { useEffect, useState } from "react";
import "../landing.css";
import bg from "../assets/background.png";
import serversalad from "../assets/server_salad.png";
import buynow from "../assets/buy_now.png";

import Navbar from "../components/NavBar/NavBar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import GradientButton from "../components/GradientButton/GradientButton.jsx";
import "../styles/fonts.css";
import "../styles/variables.css";
export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  // Load subscriptions + user email
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);

    fetch("http://127.0.0.1:8000/api/subscriptions/")
      .then((res) => res.json())
      .then((data) => setSubscriptions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // PAY NOW FUNCTION
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

      if (!data.success) {
        alert("Payment creation failed");
        return;
      }

      const paymentData = data.paymentData;

      // CREATE AUTO SUBMIT FORM
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error");
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

 return (
  <div>
    <h2 className="features-title">
      Pricing<br />
      <span>Choose a Plan That Fits Your Space and<br />Your Workflow</span>
    </h2>

    {/* Pricing Container */}
    <div className="pricing-container">
      {subscriptions.map((sub, index) => {
        // Detect tag color based on name
        const tagClass =
          sub.name.toLowerCase().includes("standard")
            ? "standard"
            : sub.name.toLowerCase().includes("plus")
            ? "plus"
            : "pro";

        // Highlight center card (optional)
        const activeClass = index === 1 ? "plus-active" : "";

        return (
          <div key={sub.id} className={`pricing-card ${activeClass}`}>
            {/* PLAN TAG */}
            <span className={`tag ${tagClass}`}>{sub.name}</span>

            {/* Price */}
            <h2>
              <span className="currency">Rs.</span>{" "}
              <span>{Number(sub.price).toFixed(2)}</span>
            </h2>

            {/* Description */}
            <p>{sub.description}</p>

            {/* Buy Button */}
            <button className="buy-btn" onClick={() => handleSubscribe(sub)}>
              <img
                src={buynow}
                alt="buy"
                style={{ width: "18px", height: "18px", marginRight: "8px" }}
              />
              Subscribe Now
            </button>

            {/* Dynamic Features */}
            {sub.features && (
              <ul>
                {sub.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

}
