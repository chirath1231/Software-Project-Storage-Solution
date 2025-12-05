import { useState } from "react";
import { Link } from "react-router-dom";
import "../landing.css";
import bg from "../assets/background.png";

function Landing() {
  return (
    <div>
      {/* Top Landing Section */}
    <section className="hero-section">
        <div className="hero-left">
          <div className="landing-content">
            <h1>Smart, Secure &<br />Affordable Cloud<br /><span className="highlight">Storage</span></h1>
            <p>
              Access, share, and manage your files anywhere with <br />fast, secure,
              and flexible storage.
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
        <h2>Everything You Need — Simplified and Secured</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Fast Uploads</h3>
            <p>Seamless file transfers optimized<br /> for large data</p>
          </div>

          <div className="feature-card">
            <h3>End-to-End Security</h3>
            <p>Protect your files with enterprise-<br />grade encryption</p>
          </div>

          <div className="feature-card">
            <h3>Smart Link Expiry</h3>
            <p>Share files with time-limited<br /> secure access</p>
          </div>

          <div className="feature-card">
            <h3>Flexible Payments</h3>
            <p>Pay as you go or subscribe — <br />your choice</p>
          </div>

          <div className="feature-card">
            <h3>Real-Time Notifications</h3>
            <p>Stay updated with instant alerts <br />for uploads, shares, and <br />expirations</p>
          </div>

          <div className="feature-card">
            <h3>Cross-Platform Access</h3>
            <p>Manage your files seamlessly <br />across web and mobile devices</p>
          </div>
        </div>
      </section>

      {/* Rest of the page */}
      <div className="black-section">
        <h2>More Content Here</h2>
        <p>All the rest of your content appears on black background.</p>
      </div>
    </div>
  );
}

export default Landing;
