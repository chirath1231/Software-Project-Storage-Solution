import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaAngleRight } from "react-icons/fa";
import serversalad from "../../assets/server_salad.png";

export default function Footer() {
  return (
    <footer className="bg-[#323D41] text-white mt-16">
      
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Logo + Description */}
        <div>
          <img src={serversalad} alt="ServerSalad Logo" className="w-20 h-20 mb-4" />
          <p className="text-sm leading-relaxed text-gray-300">
            <strong className="text-white">ServerSalad</strong> is a smart, secure, and scalable cloud storage platform
            designed for creators, professionals, and teams.
          </p>

          <div className="flex gap-4 mt-4">
            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 hover:scale-110 transition"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4 ">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 ">
            {["Home", "About Us", "Pricing", "Features"].map((item, i) => (
              <li key={i} className="flex items-center gap-2 hover:text-orange-400 before:content-none">
                <FaAngleRight className="text-orange-400" />
                <a href="#">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Blogs */}
        <div>
          <h3 className="font-semibold mb-4">Blogs</h3>
          <ul className="space-y-2 text-gray-300 ">
            <li className="flex gap-2 hover:text-orange-400 before:content-none">
              <FaAngleRight className="text-orange-400 mt-1 b" />
              <a href="#">People saying about footer.</a>
            </li>
            <li className="flex gap-2 hover:text-orange-400 before:content-none">
              <FaAngleRight className="text-orange-400 mt-1" />
              <a href="#">People saying about footer.</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-4">Contact Us</h3>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded bg-gray-200 text-black mb-3 focus:outline-none"
          />

          <button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-2 rounded mb-4">
            Submit
          </button>

          <ul className="text-sm text-gray-300 space-y-1">
            <li>+94 77 123 4567</li>
            <li>support@serversalad.com</li>
            <li>www.serversalad.com</li>
            <li>Colombo, Sri Lanka</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center py-4 border-t border-gray-600 text-sm text-gray-300">
        © 2025 All Rights Reserved
      </div>
    </footer>
  );
}
