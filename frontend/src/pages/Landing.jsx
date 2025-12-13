import { useState } from "react";
import { Link } from "react-router-dom";
import "../landing.css";
import bg from "../assets/background.png";
import serversalad from "../assets/server_salad.png";

//import Navbar from "../components/NavBar/NavBar.jsx";
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
  return (
    <div>

       {/*<Navbar />*/}
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

    
      {/* Pricing */}
      <div className="pricing-container">
      {/* Standard */}
      <div className="pricing-card">
        
        <span className="tag standard">Standard</span>
        <h2><span className="currency">$</span> <span>2/mo</span></h2>
        <p>Simple and secure for personal use. Essential features included. Best for basic storage needs.</p>

        <button className="buy-btn">
          <img 
            src={buynow}
            alt="fire"
            style={{ width: "18px", height: "18px", marginRight: "8px" }}
          />
          Buy now
        </button>
        

        <ul>
          <li>10 GB Space</li>
          <li>Ideal for individuals</li>
          <li>Basic upload & download features</li>
          <li>Secure file sharing</li>
          <li>7-day link expiry</li>
          <li>Access on web & mobile</li>
          <li>Limited to 3 active share links</li>
        </ul>
      </div>

      {/* Plus */}
      <div className="pricing-card plus-active">
        <span className="tag plus">Plus</span>
        <h2><span className="currency">$</span> <span>10/mo</span></h2>
        <p>More space and speed. Extra sharing and alerts. Ideal for frequent users.</p>

        <button className="buy-btn">
          <img 
            src={buynow}
            alt="fire"
            style={{ width: "18px", height: "18px", marginRight: "8px" }}
          />
          Buy now
        </button>

        <ul>
          <li>100 GB Space</li>
          <li>Most Popular</li>
          <li>Everything in Standard, plus</li>
          <li>Extended 30-day link expiry</li>
          <li>Priority upload speed</li>
          <li>Custom share link control</li>
          <li>Real-time notifications</li>
          <li>Email support</li>
        </ul>
      </div>

      {/* Pro */}
      <div className="pricing-card">
        <span className="tag pro">Pro</span>
        <h2><span className="currency">$</span> <span>30/mo</span></h2>
        <p>
          Advanced tools for businesses. Unlimited sharing and strong security.
          Great for professional workloads.
        </p>

        <button className="buy-btn">
          <img 
            src={buynow}
            alt="fire"
            style={{ width: "18px", height: "18px", marginRight: "8px" }}
          />
          Buy now
        </button>

        <ul>
          <li>1TB Space</li>
          <li>Best for businesses</li>
          <li>Everything in Plus, plus</li>
          <li>Unlimited file sharing</li>
          <li>Advanced analytics dashboard</li>
          <li>Client management</li>
          <li>End-to-end encryption</li>
          <li>Dedicated 24/7 support</li>
        </ul>
      </div>
    </div>

    {/* ABOUT US*/}
    <section className="about-section">
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
