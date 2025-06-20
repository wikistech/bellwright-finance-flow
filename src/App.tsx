import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RegistrationProvider } from "./contexts/RegistrationContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminRoute from "./components/auth/AdminRoute";
import SuperAdminRoute from "./components/auth/SuperAdminRoute";
import AdminPortalLink from "./components/layout/AdminPortalLink";

import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentInfo from "./pages/PaymentInfo";
import PaymentSetup from "./pages/PaymentSetup";
import Payments from "./pages/Payments";
import Loans from "./pages/Loans";
import Referrals from "./pages/Referrals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminLoans from "./pages/AdminLoans";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RegistrationProvider>
            <Routes>
              <Route path="/" element={<><LandingPage /><AdminPortalLink /></>} />
              <Route path="/login" element={<><Login /><AdminPortalLink /></>} />
              <Route path="/register" element={<><Register /><AdminPortalLink /></>} />
              <Route path="/payment-info" element={<PaymentInfo />} />
              <Route path="/payment-setup" element={<PaymentSetup />} />
              
              {/* Admin Auth Routes (public) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* SuperAdmin Auth Routes (public) */}
              <Route path="/superadmin/login" element={<SuperAdminLogin />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Admin Protected Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/loans" element={<AdminLoans />} />
              </Route>
              
              {/* SuperAdmin Protected Routes */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RegistrationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
