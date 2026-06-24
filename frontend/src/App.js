import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "./auth/AuthContext.jsx";
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Protection
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Landing from "./pages/landing.jsx";
import Login from "./pages/Login";
import Register from "./pages/register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import RestoreAccount from "./pages/RestoreAccount.jsx";
import SharedFile from "./pages/SharedFile";

// Dashboard Pages
import DashboardHome from "./pages/DashboardHome";
import MyFiles from "./pages/MyFiles";
import Trash from "./pages/Trash.jsx";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";
import Notifications from "./pages/Notifications.jsx";
import DashboardSupport from "./pages/DashboardSupport";
import DashboardSettings from "./pages/DashboardSettings.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import SecuritySettings from "./pages/SecuritySettings.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import TicketSubmission from "./pages/TicketSubmission.jsx";
import DeleteAccount from "./pages/DeleteAccount.jsx";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminTickets from "./pages/AdminTickets";
import AdminSubscriptionAnalytics from "./pages/AdminSubscriptionAnalytics";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global Brain Provider - MUST wrap routes to prevent context crashes */}
        <NotificationProvider>
          <Routes>
            
            {/* 1. PUBLIC ROUTES */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shared/:token" element={<SharedFile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/restore-account" element={<RestoreAccount />} />

            {/* 2. ADMIN ROUTES (Public for development) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/subscription-analytics" element={<AdminSubscriptionAnalytics />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* 3. PROTECTED USER DASHBOARD ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="files" element={<MyFiles />} />
                <Route path="trash" element={<Trash />} />
                <Route path="chat" element={<ClientChatSystem />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<DashboardSupport />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="settings/profile" element={<ProfileSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="ticket-submission" element={<TicketSubmission />} />
                <Route path="delete-account" element={<DeleteAccount />} /> 
              </Route>
            </Route>

          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;