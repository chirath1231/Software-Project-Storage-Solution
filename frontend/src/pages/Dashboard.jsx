import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/NavBar/NavBar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Footer from "../components/Footer/Footer.jsx";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    
    <div>
      <Navbar />
      <Sidebar/>
      <Footer/>
    </div>
  );
}