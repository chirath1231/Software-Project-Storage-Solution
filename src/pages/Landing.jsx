import React from "react";
import Navbar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="content">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
      <Footer />
    </>
  );
}
