import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaAngleRight } from "react-icons/fa";
import Cloud_Service_Logo from "../../assets/Cloud_Service_Logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-col">
          <div className="footer-logo">
            <img src={Cloud_Service_Logo} alt="ServerSalad Logo" />
          </div>
          <p>
            <strong>ServerSalad</strong> is a smart, secure, and scalable cloud storage platform designed for creators, 
            professionals, and teams. We make storing, sharing, and managing your files simple — without limits or complexity
          </p>

          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <p>Quick Links</p>
          <ul>
            <li>
                <FaAngleRight />
                <a href="/">Home
                </a></li>
            <li>
                <FaAngleRight />
                <a href="/about">About Us
                </a></li>
            <li>
                <FaAngleRight />
                <a href="/pricing">Pricing
                </a></li>
            <li>
                <FaAngleRight />
                <a href="/features">Features
                </a></li>
          </ul>
        </div>

        <div className="footer-col">
          <p>Blogs</p>
          <ul>
            <li><FaAngleRight /><a href="/">People saying about footer.</a></li>
            <li><FaAngleRight /><a href="/">People saying about footer.</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <p>Contact Us</p>
          <form>
            <input type="email" placeholder="Enter your email " />
            <button className="gradient-btn">Submit</button>
          </form>
          <ul className="contacts-ul">
            <li>+94 77 123 4567</li>
            <li>support@serversalad.com</li>
            <li>www.serversalad.com</li>
            <li>ServerSalad Technologies (Pvt) Ltd 
                No.42, Innovation Street, Colombo, Sri Lanka</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2025 All Rights Reserved</p>
      </div>
    </footer>
  );
}
