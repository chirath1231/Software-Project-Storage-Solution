import { useState } from "react";
import { Link } from "react-router-dom";
import "../landing.css";
import bg from "../assets/background.png";

// Importing images correctly
import fast_upload from "../assets/fast_upload.png";
import flexible_payment from "../assets/flexible_payment.png";
import end_to_end from "../assets/end_to_end.png";
import smart_link from "../assets/smart_link.png";
import real_time from "../assets/real_time.png";
import cross_platform from "../assets/cross_platform.png";

function Landing() {
  return (
    <div>
      {/* Top Landing Section */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="landing-content">
            <h1>
              Smart, Secure &<br />Affordable Cloud<br />
              <span className="highlight">Storage</span>
            </h1>
            <p>
              Access, share, and manage your files anywhere with <br />
              fast, secure, and flexible storage.
            </p>
            <button>Get Started</button>
          </div>
        </div>

        <div
          className="hero-right"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </section>

      {/* Features Section */}


      <section className="features-section">
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

      <h2 className="features-title">
          Pricing<br /> <span>Choose a Plan That Fits Your Space and<br />Your Workflow</span>
         </h2>

      <div className="black-section">
        <h2>More Content Here</h2>
        <p>All the rest of your content appears on black background.</p>
      </div>
    </div>
  );
}

export default Landing;
