import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import "../landing.css";
import bg from "../assets/background.png";
import serversalad from "../assets/server_salad.png";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar/NavBar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import GradientButton from "../components/GradientButton/GradientButton.jsx";
import "../styles/fonts.css";
import "../styles/variables.css";


// Importing images correctly
import fast_upload from "../assets/fast_upload.png";
import flexible_payment from "../assets/flexible_payment.png";
import end_to_end from "../assets/end_to_end.png";
import smart_link from "../assets/smart_link.png";
import real_time from "../assets/real_time.png";
import cross_platform from "../assets/cross_platform.png";
import buynow from "../assets/buy_now.png";

function Landing() {
    const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
useEffect(() => {
  fetch("http://127.0.0.1:8000/api/subscriptions/")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch plans");
      }
      return res.json();
    })
    .then((data) => {
      // Ensure it's always an array
      if (Array.isArray(data)) {
        setPlans(data);
      } else if (data.results) {
        // Django pagination case
        setPlans(data.results);
      } else {
        setPlans([]);
      }
    })
    .catch((err) => {
      console.error("Error fetching plans:", err);
      setPlans([]); // prevent crash
    })
    .finally(() => setLoading(false));
}, []);

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    <div>

       <Navbar />
       
       
      {/* Top Landing Section */}
      <section id="home" className="hero-section">
        <div className="hero-left">
          <div className="landing-content">
<h1 style={{ fontSize: "75px", lineHeight: "1.2" }}>
  Smart, Secure &<br />Affordable Cloud<br />
  <span className="highlight" style={{ fontSize: "60px" }}>Storage</span>
</h1>
<p style={{ fontSize: "18px", lineHeight: "1.5" }}>
  Access, share, and manage your files anywhere with <br />
  fast, secure, and flexible storage.
</p>
            <button onClick={() => navigate("/login")}>Get Started</button>
          </div>
        </div>

        <div
          className="hero-right"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </section>

      {/* Features Section */}


      <section id="features" className="features-section">
         <h2 className="features-title">
          Everything you need,<br /> <span>simplified & secured</span>
         </h2>
        <div className="features-container">

          <div className="feature-card">
            <img src={fast_upload} alt="Fast Uploads" className="feature-icon" />
            <div className="feature-text">
              <h3>Fast Uploads</h3>
              <p>Seamless file transfers optimized for <br />large data</p>
            </div>
          </div>

          <div className="feature-card">
            <img src={flexible_payment} alt="Flexible Payments" className="feature-icon" />
            <div className="feature-text">
              <h3>Flexible Payments</h3>
              <p>Pay as you go or subscribe — <br /> your choice</p>
            </div>
          </div>

          <div className="feature-card">
            <img src={end_to_end} alt="End-to-End Security" className="feature-icon" />
            <div className="feature-text">
              <h3>End-to-End Security</h3>
              <p>Protect your files with enterprise- <br />grade encryption</p>
            </div>
          </div>

          <div className="feature-card">
            <img src={smart_link} alt="Smart Link Expiry" className="feature-icon" />
            <div className="feature-text">
              <h3>Smart Link Expiry</h3>
              <p>Share files with time-limited <br /> secure access</p>
            </div>
          </div>

          <div className="feature-card">
            <img src={real_time} alt="Real-Time Notifications" className="feature-icon" />
            <div className="feature-text">
              <h3>Real-Time Notifications</h3>
              <p>Stay updated with instant alerts <br /> for uploads, shares, and <br /> expirations</p>
            </div>
          </div>

          <div className="feature-card">
            <img src={cross_platform} alt="Cross-Platform Access" className="feature-icon" />
            <div className="feature-text">
              <h3>Cross-Platform Access</h3>
              <p>Manage your files seamlessly <br /> across web and mobile devices</p>
            </div>
          </div>

        </div>
      </section>

    <section id="pricing">
      <h2 className="features-title">
        Pricing<br />
        <span>
          Choose a Plan That Fits Your Space and
          <br />
          Your Workflow
        </span>
      </h2>

      <div className="pricing-container">
        {plans.map((plan) => (
          <div className="pricing-card" key={plan.id}>
            {/* Tag */}
            <span className={`tag ${plan.name.toLowerCase()}`}>
              {plan.name}
            </span>

            {/* Price */}
            <h2>
              <span className="currency">Rs.</span>{" "}
              <span>{plan.price}/mo</span>
            </h2>

            {/* Description */}
            <p>{plan.description}</p>

            {/* Buy button (no payment integration) */}
    <button
      className="buy-btn"
      onClick={() => navigate("/subscription")}
    >
      <img
        src={buynow}
        alt="buy"
        style={{
          width: "18px",
          height: "18px",
          marginRight: "8px",
        }}
      />
      Buy now
    </button>

            {/* Features */}
            {plan.features && plan.features.length > 0 && (
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>

    {/* ABOUT US*/}
    <section id="aboutus" className="about-section">
      <h2 className="about-title">About Us</h2>

      <div className="about-container">
        <div className="about-image">
          <img src={serversalad} alt="ServerSalad Logo" />
        </div>

        <div className="about-text">
          <h3>ServerSalad</h3>
          <p>
            At ServerSalad, we’re redefining cloud storage with simplicity,
            security, and speed. Our mission is to help creators,
            professionals, and businesses store and share data with complete
            confidence — no limits, no complexity.<br />
        
            From solo photographers to growing teams, thousands of users trust
            ServerSalad to keep their digital work safe and accessible anytime,
            anywhere.
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <h3>10,000+</h3>
          <p>Active Clients</p>
        </div>

        <div className="stat-box">
          <h3>1.2M+</h3>
          <p>Files Stored Securely</p>
        </div>

        <div className="stat-box">
          <h3>25+</h3>
          <p>Countries Worldwide</p>
        </div>
      </div>
    </section>

     <Footer />

    </div>
  );
}

export default Landing;