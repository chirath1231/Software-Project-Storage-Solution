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
import MyFiles from "./pages/MyFiles";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ProfilePage from "./pages/MyProfile.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx"
import DashboardSettings from "./pages/DashboardSettings.jsx";
import DeleteAccount from "./pages/DeleteAccount.jsx";
import RestoreAccount from "./pages/RestoreAccount.jsx";
import SecuritySettings from "./pages/SecuritySettings.jsx"

function App() {
  return (
    
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="payment-success" element={<PaymentSuccess />} />


          {/* Forgot/Reset password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/restore-account" element={<RestoreAccount />} />

          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile-settings" element={<ProfileSettings />} />              
              <Route path="files" element={<MyFiles />} />
              <Route index element={<DashboardHome />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              {/* <Route path="payment-success" element={<PaymentSuccess />} /> */}
              <Route path="settings" element={<DashboardSettings />} /> 
              <Route path="delete-account" element={<DeleteAccount />} /> 
              <Route path="security" element={<SecuritySettings />} />      
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
