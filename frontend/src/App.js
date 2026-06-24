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
<<<<<<< HEAD
import AdminUsers from "./pages/AdminUsers"; 
import Notifications from "./pages/Notifications";
import { NotificationProvider } from './context/NotificationContext'; // <-- Global Brain imported

=======
import AdminUsers from "./pages/AdminUsers"; // Import the new page
import Notifications from "./pages/Notifications.jsx";
>>>>>>> 033a4415673509957acf845880283bc658bc5224
import DashboardSupport from "./pages/DashboardSupport";
import DashboardSettings from "./pages/DashboardSettings.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import MyFiles from "./pages/MyFiles";
import ClientChatSystem from "./pages/ClientChatSystem.jsx";
import Trash from "./pages/Trash.jsx";


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

<<<<<<< HEAD
            {/* ADMIN ROUTES (Public for development as requested) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              
              {/* Stubs for other admin pages (using AdminUsers as placeholder if files not created yet) */}
              <Route path="/admin/reports" element={<div>Reports Page</div>} />
              <Route path="/admin/subscription-analytics" element={<div>Subscription Analytics Page</div>} />
              <Route path="/admin/tickets" element={<div>Tickets Page</div>} />
              <Route path="/admin/settings" element={<div>Admin Settings Page</div>} />
=======
          {/* ADMIN ROUTES (Public for development as requested) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            
            {/* Stubs for other admin pages (using AdminUsers as placeholder if files not created yet) */}
            <Route path="/admin/reports" element={<div>Reports Page</div>} />
            <Route path="/admin/subscription-analytics" element={<div>Subscription Analytics Page</div>} />
            <Route path="/admin/tickets" element={<div>Tickets Page</div>} />
            <Route path="/admin/settings" element={<div>Admin Settings Page</div>} />
          </Route>

          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="files" element={<MyFiles />} />
              <Route path="chat" element={<ClientChatSystem />} />
              <Route index element={<DashboardHome />} />
              <Route path="support" element={<DashboardSupport />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="trash" element={<Trash />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings/profile" element={<ProfileSettings />} />
>>>>>>> 033a4415673509957acf845880283bc658bc5224
            </Route>

            {/* PROTECTED */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="files" element={<MyFiles />} />
                <Route path="chat" element={<ClientChatSystem />} />
                <Route path="notifications" element={<Notifications />} />
                <Route index element={<DashboardHome />} />
                <Route path="support" element={<DashboardSupport />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="settings/profile" element={<ProfileSettings />} />
              </Route>
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
<<<<<<< HEAD

=======
>>>>>>> 033a4415673509957acf845880283bc658bc5224
export default App;