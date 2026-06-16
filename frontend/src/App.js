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
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminTickets from "./pages/AdminTickets";
import AdminSubscriptionAnalytics from "./pages/AdminSubscriptionAnalytics";
import Trash from "./pages/Trash.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import DashboardSupport from "./pages/DashboardSupport";
import DashboardSettings from "./pages/DashboardSettings.jsx";
import Notifications from "./pages/Notifications.jsx";
import MyFiles from "./pages/MyFiles";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";
import TicketSubmission from "./pages/TicketSubmission.jsx";
import DeleteAccount from "./pages/DeleteAccount.jsx";
import RestoreAccount from "./pages/RestoreAccount.jsx";
import SecuritySettings from "./pages/SecuritySettings.jsx"
import { NotificationProvider } from './context/NotificationContext';
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import SharedFile from "./pages/SharedFile";

// Inside your routes:


function App() {
  return (
    
    <BrowserRouter>
      <AuthProvider>

    {/* <NotificationProvider> */}
        <Routes>
          {/* PUBLIC */}
          <Route path="/shared/:token" element={<SharedFile />} />
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN ROUTES (Public for development as requested) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            
            {/* Stubs for other admin pages (using AdminUsers as placeholder if files not created yet) */}
            <Route path="/admin/reports" element={<div>Reports Page</div>} />
            <Route path="/admin/subscription-analytics" element={<div>Subscription Analytics Page</div>} />
            <Route path="/admin/tickets" element={<div>Tickets Page</div>} />
            <Route path="/admin/settings" element={<div>Admin Settings Page</div>} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/restore-account" element={<RestoreAccount />} />

          </Route>



          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="files" element={<MyFiles />} />
              <Route path="trash" element={<Trash />} />
              <Route path="chat" element={<ClientChatSystem />} />
              <Route index element={<DashboardHome />} />
              <Route path="support" element={<DashboardSupport />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="settings/profile" element={<ProfileSettings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="ticket-submission" element={<TicketSubmission />} />
              <Route path="delete-account" element={<DeleteAccount />} /> 
              <Route path="security" element={<SecuritySettings />} /> 
              <Route path="profile-settings" element={<ProfileSettings />} />             
              

            </Route>
          </Route>
        </Routes>
      {/* </NotificationProvider> */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
