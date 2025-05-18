
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";

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
            <Route 
              path="/" 
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              } 
            />
            <Route path="/clients" element={<AppLayout><div>Clients Page</div></AppLayout>} />
            <Route path="/services" element={<AppLayout><div>Services Page</div></AppLayout>} />
            <Route path="/orders" element={<AppLayout><div>Orders Page</div></AppLayout>} />
            <Route path="/tasks" element={<AppLayout><div>Tasks Page</div></AppLayout>} />
            <Route path="/tickets" element={<AppLayout><div>Tickets Page</div></AppLayout>} />
            <Route path="/invoices" element={<AppLayout><div>Invoices Page</div></AppLayout>} />
            <Route path="/subscriptions" element={<AppLayout><div>Subscriptions Page</div></AppLayout>} />
            <Route path="/marketing" element={<AppLayout><div>Marketing Page</div></AppLayout>} />
            <Route path="/team" element={<AppLayout><div>Team Page</div></AppLayout>} />
            <Route path="/support" element={<AppLayout><div>Support Page</div></AppLayout>} />
            <Route path="/settings" element={<AppLayout><div>Settings Page</div></AppLayout>} />
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
