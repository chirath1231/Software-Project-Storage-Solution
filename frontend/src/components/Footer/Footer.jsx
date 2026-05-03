import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaAngleRight } from "react-icons/fa";
import serversalad from "../../assets/server_salad.png";

export default function Footer() {
  return (
    <footer style={{ background: "var(--secondary-color)", padding: "40px 0" }}>

      {/* Grid Container */}
      <div className="grid gap-5 px-[5%]"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", justifyItems: "center" }}>

        {/* Col 1 - Logo + About */}
        <div style={{ lineHeight: "1.3" }}>
          <div className="mb-3">
            <img src={serversalad} alt="ServerSalad Logo" className="w-20 object-contain" />
          </div>
          <p style={{ color: "var(--primary-color)", lineHeight: "1.6" }}>
            <strong>ServerSalad</strong> is a smart, secure, and scalable cloud storage platform designed for creators,
            professionals, and teams. We make storing, sharing, and managing your files simple — without limits or complexity
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            {[
              { href: "https://facebook.com", icon: <FaFacebook /> },
              { href: "https://twitter.com",  icon: <FaTwitter /> },
              { href: "https://instagram.com",icon: <FaInstagram /> },
              { href: "https://youtube.com",  icon: <FaYoutube /> },
            ].map(({ href, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform duration-300 hover:scale-110"
                style={{
                  color: "var(--primary-color)",
                  background: "var(--primary-gradient-start)",
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 - Quick Links */}
        <div style={{ lineHeight: "1.3" }}>
          <p style={{ color: "var(--primary-color)" }}>Quick Links</p>
          <ul className="list-none m-0 p-0 mt-2">
            {[
              { href: "/",         label: "Home" },
              { href: "/about",    label: "About Us" },
              { href: "/pricing",  label: "Pricing" },
              { href: "/features", label: "Features" },
            ].map(({ href, label }) => (
              <li key={label} className="flex items-center mb-2.5"
                style={{ color: "var(--primary-color)" }}>
                <FaAngleRight style={{ color: "var(--primary-gradient-start)", marginRight: "8px" }} />
                <a
                  href={href}
                  className="no-underline transition-colors duration-300"
                  style={{ color: "var(--primary-color)" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--text-color-2)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--primary-color)")}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 - Blogs */}
        <div style={{ lineHeight: "1.3" }}>
          <p style={{ color: "var(--primary-color)" }}>Blogs</p>
          <ul className="list-none m-0 p-0 mt-2">
            {["People saying about footer.", "People saying about footer."].map((text, i) => (
              <li key={i} className="flex items-center mb-2.5"
                style={{ color: "var(--primary-color)" }}>
                <FaAngleRight style={{ color: "var(--primary-gradient-start)", marginRight: "8px" }} />
                <a
                  href="/"
                  className="no-underline transition-colors duration-300"
                  style={{ color: "var(--primary-color)" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--text-color-2)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--primary-color)")}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 - Contact */}
        <div style={{ lineHeight: "1.3" }}>
          <p className="mb-5" style={{ color: "var(--primary-color)" }}>Contact Us</p>
          <ul className="list-none m-0 p-0 w-full max-w-[300px]">
            {[
              "+94 77 123 4567",
              "support@serversalad.com",
              "www.serversalad.com",
              "ServerSalad Technologies (Pvt) Ltd No.42, Innovation Street, Colombo, Sri Lanka",
            ].map((item, i) => (
              <li key={i} className="mb-2.5" style={{ color: "var(--primary-color)" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-sm mt-6" style={{ color: "var(--primary-color)" }}>
        <p>© 2025 All Rights Reserved</p>
      </div>
    </footer>
  );
}