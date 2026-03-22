import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/Login";
import Landing from "./pages/landing.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
<<<<<<< HEAD
import Dashboard from "./pages/Dashboard.jsx";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";
=======
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MyFiles from "./pages/MyFiles";
<<<<<<< HEAD
import Notifications from './pages/Notifications';
import MyProfile from './pages/MyProfile';
>>>>>>> 09dd24186fec7dc528f4ce694b942caf1035fecd
=======
>>>>>>> chirath

function App() {
  return (

    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* PUBLIC PAGES */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED PAGES */}
          <Route element={<ProtectedRoute />}>
<<<<<<< HEAD
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/clientchatsystem" element={<ClientChatSystem />} />
=======
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="files" element={<MyFiles />} />
              <Route index element={<DashboardHome />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
            </Route>
>>>>>>> 09dd24186fec7dc528f4ce694b942caf1035fecd
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
