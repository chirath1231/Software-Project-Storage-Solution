import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/Login";
import Landing from "./pages/Landing.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./components/NavBar/NavBar.jsx"; // ✅ add this
import { AuthProvider } from "./context/AuthContext";

function AppRoutes() {
  const location = useLocation();

  // routes where navbar should be hidden
  const hideNavbarRoutes = ["/login", "/register"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes /> {/* your routes and navbar logic */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
