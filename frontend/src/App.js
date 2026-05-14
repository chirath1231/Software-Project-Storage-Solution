import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/register.jsx";
import Login from "./pages/Login";
import Landing from "./pages/landing.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/AdminUsers"; 
import DashboardSupport from "./pages/DashboardSupport";
import DashboardSettings from "./pages/DashboardSettings.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import Notifications from "./pages/Notifications.jsx";
import MyFiles from "./pages/MyFiles";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";
import TicketSubmission from "./pages/TicketSubmission.jsx";
import { NotificationProvider } from './context/NotificationContext'; // <-- Global Brain imported

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Wrapping the entire routing system in the Notification Provider */}
        <NotificationProvider>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ADMIN ROUTES (Public for development as requested) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              
              {/* Stubs for other admin pages */}
              <Route path="/admin/reports" element={<div>Reports Page</div>} />
              <Route path="/admin/subscription-analytics" element={<div>Subscription Analytics Page</div>} />
              <Route path="/admin/tickets" element={<div>Tickets Page</div>} />
              <Route path="/admin/settings" element={<div>Admin Settings Page</div>} />
            </Route>

            {/* PROTECTED */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="files" element={<MyFiles />} />
                <Route path="chat" element={<ClientChatSystem />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<DashboardSupport />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="settings/profile" element={<ProfileSettings />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="payment-success/*" element={<PaymentSuccess />} />
                <Route path="ticket-submission" element={<TicketSubmission />} />
              </Route>
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;