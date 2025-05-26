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
import { ClientDashboard } from "./pages/ClientDashboard";
import { ClientServices } from "./pages/ClientServices";
import { Invoices } from "./pages/Invoices";

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
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
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
              <ProtectedRoute>
                <AppLayout><Orders /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <AppLayout><Tasks /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <AppLayout><Tickets /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <AppLayout><Invoices /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/marketing" element={
              <ProtectedRoute>
                <AppLayout><div>Marketing Page</div></AppLayout>
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
              <ProtectedRoute>
                <AppLayout><div>Support Page</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><div>Settings Page</div></AppLayout>
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
