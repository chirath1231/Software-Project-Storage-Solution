import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar/NavBar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import GradientButton from "../components/GradientButton/GradientButton.jsx";
import "../styles/fonts.css";
import "../styles/variables.css";

// Importing images correctly
import bg from "../assets/background.png";
import serversalad from "../assets/server_salad.png";
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
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error("Error fetching plans:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2 className="text-center text-2xl mt-10">Loading...</h2>;

  return (
    <div>
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section
        id="home"
        className="flex w-full min-h-screen items-center justify-start px-[1in] gap-10 box-border"
      >
        <div className="flex-1 basis-[600px] flex items-center justify-start">
          <div>
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: "75px",
                lineHeight: "1.2",
                color: "black",
              }}
            >
              Smart, Secure &<br />Affordable Cloud<br />
              <span style={{ color: "#FF6C03", fontSize: "60px" }}>Storage</span>
            </h1>

            <p style={{ fontSize: "18px", lineHeight: "1.5", marginTop: "18px", opacity: 0.9 }}>
              Access, share, and manage your files anywhere with <br />
              fast, secure, and flexible storage.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 px-7 py-3 text-white rounded-md cursor-pointer transition-all duration-300 hover:opacity-90"
              style={{
                background: "linear-gradient(to right, orange, #ff7a00)",
                border: "none",
                fontSize: "18px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Get Started
            </button>
          </div>
        </div>

        <div
          className="w-[644px] h-[666px] bg-cover bg-center bg-no-repeat flex-shrink-0 -ml-[60px]"
          style={{ backgroundImage: `url(${bg})` }}
        />
      </section>

      {/* ── FEATURES SECTION ── */}
      <section
        id="features"
        className="bg-white py-20 px-5 flex flex-col items-center text-center"
      >
        <h2
          className="mb-12 text-center"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "42px",
            fontWeight: 550,
            color: "black",
          }}
        >
          Everything you need,<br />
          <span style={{ fontSize: "24px", fontWeight: 300, lineHeight: 1 }}>
            simplified &amp; secured
          </span>
        </h2>

        <div
          className="grid gap-x-[60px] gap-y-[50px] justify-center"
          style={{ gridTemplateColumns: "repeat(2, 453px)" }}
        >
          {[
            { src: fast_upload,       alt: "Fast Uploads",           title: "Fast Uploads",           desc: "Seamless file transfers optimized for large data" },
            { src: flexible_payment,  alt: "Flexible Payments",      title: "Flexible Payments",      desc: "Pay as you go or subscribe — your choice" },
            { src: end_to_end,        alt: "End-to-End Security",    title: "End-to-End Security",    desc: "Protect your files with enterprise-grade encryption" },
            { src: smart_link,        alt: "Smart Link Expiry",      title: "Smart Link Expiry",      desc: "Share files with time-limited secure access" },
            { src: real_time,         alt: "Real-Time Notifications",title: "Real-Time Notifications",desc: "Stay updated with instant alerts for uploads, shares, and expirations" },
            { src: cross_platform,    alt: "Cross-Platform Access",  title: "Cross-Platform Access",  desc: "Manage your files seamlessly across web and mobile devices" },
          ].map((f) => (
            <div
              key={f.title}
              className="w-[350px] h-[100px] flex items-center bg-white rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 8px 20px #ed751f" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 12px 25px #ee9759")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 20px #ed751f")}
            >
              <img src={f.src} alt={f.alt} className="w-[60px] h-[60px] mr-5" />
              <div>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    margin: "0 0 6px 0",
                    color: "#000",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    margin: 0,
                    color: "#555",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing">
        <h2
          className="text-center"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "42px",
            fontWeight: 550,
            color: "black",
            marginBottom: "50px",
          }}
        >
          Pricing<br />
          <span style={{ fontSize: "24px", fontWeight: 300, lineHeight: 1 }}>
            Choose a Plan That Fits Your Space and
            <br />
            Your Workflow
          </span>
        </h2>

        <div className="flex justify-center gap-8 px-10 flex-wrap" style={{ fontFamily: "Arial, sans-serif" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl p-8 w-[280px] relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.name.toLowerCase() === "plus"
                  ? "border-2 border-orange-400 scale-[1.04]"
                  : ""
              }`}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              {/* Tag */}
              <span
                className={`absolute -top-3 left-5 px-3 py-1 rounded-md text-xs font-bold text-[#ed8337] ${
                  plan.name.toLowerCase() === "standard" ? "bg-[#f5dfcf]" :
                  plan.name.toLowerCase() === "plus"     ? "bg-[#f5dfcf]" :
                                                           "bg-[#f5dfcf]"
                }`}
              >
                {plan.name}
              </span>

              {/* Price */}
              <h2 className="text-3xl mb-3">
                <span style={{ color: "rgb(201,196,196)", fontWeight: "normal", fontSize: "30px" }}>
                  Rs.
                </span>{" "}
                <span className="text-4xl font-bold">{plan.price}/mo</span>
              </h2>

              {/* Description */}
              <p>{plan.description}</p>

              {/* Buy button */}
              <button
                className="w-full text-white py-3 rounded-full text-base my-4 cursor-pointer border-none flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(to right, orange, #ff7a00)" }}
                onClick={() => navigate("/login")}
              >
                <img
                  src={buynow}
                  alt="buy"
                  style={{ width: "18px", height: "18px", display: "block" }}
                />
                Buy Now
              </button>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <ul className="list-none p-0">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="my-2 flex items-center">
                      <span className="text-orange-400 mr-2">✔</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT US SECTION ── */}
      <section id="aboutus" className="w-full py-16 px-5 text-center">
        <h2
          className="text-4xl font-bold mb-12"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          About Us
        </h2>

        <div className="flex justify-center items-start gap-10 max-w-[900px] mx-auto mb-10">
          <div>
            <img
              src={serversalad}
              alt="ServerSalad Logo"
              className="w-[400px] h-auto rounded-[25px] -ml-[125px] mt-[10px]"
            />
          </div>

          <div className="text-left w-full" style={{ maxWidth: "1600px" }}>
            <h3 className="text-[26px] font-bold mb-3">ServerSalad</h3>
            <p className="text-[25px] leading-relaxed text-[#333] mb-3">
              At ServerSalad, we're redefining cloud storage with simplicity,
              security, and speed. Our mission is to help creators,
              professionals, and businesses store and share data with complete
              confidence — no limits, no complexity.<br />
              From solo photographers to growing teams, thousands of users trust
              ServerSalad to keep their digital work safe and accessible anytime,
              anywhere.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-[70px] mt-12">
          {[
            { value: "10,000+", label: "Active Clients" },
            { value: "1.2M+",   label: "Files Stored Securely" },
            { value: "25+",     label: "Countries Worldwide" },
          ].map((stat) => (
            <div key={stat.label}>
              <h3
                className="text-[64px] font-bold mb-1"
                style={{ color: "#ff7a26" }}
              >
                {stat.value}
              </h3>
              <p className="mt-0 text-[17px] font-medium text-[#121111]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;