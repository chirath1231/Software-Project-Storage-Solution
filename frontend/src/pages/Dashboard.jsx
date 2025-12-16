import { Link } from "react-router-dom";
import Navbar from "../components/NavBar/Navbar.jsx";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";

function Dashboard() {
  return (
  
    <div>
      <Navbar />
      <Sidebar />
      <Footer />
    </div>

   
  );
}

export default Dashboard;