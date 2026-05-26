import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import About from './pages/About';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuthStore } from './stores/auth.store';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  if (!isAuthenticated || isTokenExpired()) {
    if (isTokenExpired()) {
      logout();
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
