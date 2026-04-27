import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/Login";
import Landing from "./pages/landing.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

import Dashboard from "./pages/Dashboard.jsx";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import MyFiles from "./pages/MyFiles";
import Notifications from './pages/Notifications';
import MyProfile from './pages/MyProfile';
import DashboardSettings from "./pages/DashboardSettings.jsx";
import TicketSubmission from "./pages/TicketSubmission.jsx";


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

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/clientchatsystem" element={<ClientChatSystem />} />
            <Route path="/ticket-submission" element={<TicketSubmission />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="files" element={<MyFiles />} />
              <Route index element={<DashboardHome />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="/dashboard/notifications" element={<Notifications />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="settings" element={<DashboardSettings />} />

            </Route>

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
