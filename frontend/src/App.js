import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "./auth/AuthContext.jsx";
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Protection
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
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
import SharedFolder from "./pages/SharedFolder.jsx";

// Dashboard Pages
import DashboardHome from "./pages/DashboardHome";
import MyFiles from "./pages/MyFiles";
import Trash from "./pages/Trash.jsx";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";
import Notifications from "./pages/Notifications.jsx";
import DashboardSupport from "./pages/DashboardSupport";
import DashboardSettings from "./pages/DashboardSettings.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import SecuritySettings from "./pages/SecuritySettings.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import TicketSubmission from "./pages/TicketSubmission.jsx";
import DeleteAccount from "./pages/DeleteAccount.jsx";

// Admin Pages
import AdminOverview from "./pages/AdminOverview.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminTickets from "./pages/AdminTickets";
import AdminSubscriptionAnalytics from "./pages/AdminSubscriptionAnalytics";
import AdminPermissionsManager from "./pages/AdminPermissionsManager";
import AdminUnauthorized from "./pages/AdminUnauthorized";

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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/restore-account" element={<RestoreAccount />} />
            {/* Shared file/folder — handle their own auth, redirect to login if needed */}
            <Route path="/shared/:token" element={<SharedFile />} />
            <Route path="/shared/folder/:token" element={<SharedFolder />} />

            {/* 2. ADMIN RBAC PROTECTED ROUTES */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin-dashboard" element={<AdminRoute requiredPermission="reports.view"><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute requiredPermission="users.view"><AdminUsers /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute requiredPermission="reports.view"><AdminReports /></AdminRoute>} />
              <Route path="/admin/subscription-analytics" element={<AdminRoute requiredPermission="payments.view"><AdminSubscriptionAnalytics /></AdminRoute>} />
              <Route path="/admin/tickets" element={<AdminRoute requiredPermission="support.view"><AdminTickets /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute requiredPermission="settings.view"><AdminSettings /></AdminRoute>} />
              <Route path="/admin/permissions" element={<AdminRoute requiredPermission="admin_permissions.manage"><AdminPermissionsManager /></AdminRoute>} />
              <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
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
                <Route path="profile" element={<MyProfile />} />
                <Route path="profile-settings" element={<ProfileSettings />} />
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
