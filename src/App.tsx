
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Clients } from "./pages/Clients";
import { Team } from "./pages/Team";
import { Services } from "./pages/Services";
import { Orders } from "./pages/Orders";
import { Tasks } from "./pages/Tasks";
import { Tickets } from "./pages/Tickets";
import { ClientTickets } from "./pages/ClientTickets";
import { ClientDashboard } from "./pages/ClientDashboard";
import { ClientServices } from "./pages/ClientServices";
import { ClientInvoices } from "./pages/ClientInvoices";
import { Invoices } from "./pages/Invoices";
import { Support } from "./pages/Support";
import { ClientSupport } from "./pages/ClientSupport";
import { Settings } from "./pages/Settings";
import { Marketing } from "./pages/Marketing";
import { Subscriptions } from "./pages/Subscriptions";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Client routes */}
            <Route path="/client" element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ClientDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/services" element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ClientServices />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/tickets" element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ClientTickets />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/invoices" element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ClientInvoices />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/client/support" element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ClientSupport />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin/Team routes */}
            <Route path="/" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Clients />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Services />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout><Orders /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout><Tasks /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Tickets />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout><Invoices /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/subscriptions" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout><Subscriptions /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/marketing" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout><Marketing /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Team />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout><Support /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Error routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
