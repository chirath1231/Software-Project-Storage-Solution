import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/Login";
import Landing from "./pages/landing.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        < Route path="dashboard" element={< Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
