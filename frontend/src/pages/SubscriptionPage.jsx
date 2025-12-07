import React, { useEffect, useState } from "react";

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

  // ✅ PAY NOW FUNCTION (FORM SUBMIT METHOD)
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

      // ✅ CREATE AUTO SUBMIT FORM
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
    <div style={{ padding: "30px" }}>
      <h1 style={{ marginBottom: "20px" }}>Available Subscriptions</h1>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))" }}>
        {subscriptions.map((sub) => (
          <div key={sub.id} style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
            <h2>{sub.name}</h2>
            <p>{sub.description}</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              Rs. {sub.price}
            </p>

            <button
              onClick={() => handleSubscribe(sub)}
              style={{
                marginTop: 12,
                padding: "10px 15px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
