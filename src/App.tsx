
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/hooks/useAuth';

// Layouts
import MobileLayout from '@/components/layout/MobileLayout';
import ModernLayout from '@/components/shared/ModernLayout';

// Pages
import Landing from '@/pages/Landing';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Blog from '@/pages/Blog';
import BlogSingle from '@/pages/BlogSingle';
import Documentation from '@/pages/Documentation';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import TranslationApp from '@/pages/TranslationApp';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user?.roles?.includes('admin')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Pages with ModernLayout */}
            <Route path="/" element={<ModernLayout><Landing /></ModernLayout>} />
            <Route path="/features" element={<ModernLayout><Features /></ModernLayout>} />
            <Route path="/pricing" element={<ModernLayout><Pricing /></ModernLayout>} />
            <Route path="/blog" element={<ModernLayout><Blog /></ModernLayout>} />
            <Route path="/blog/:slug" element={<ModernLayout><BlogSingle /></ModernLayout>} />
            <Route path="/docs" element={<ModernLayout><Documentation /></ModernLayout>} />
            <Route path="/contact" element={<ModernLayout><Contact /></ModernLayout>} />
            <Route path="/terms" element={<ModernLayout><Terms /></ModernLayout>} />
            <Route path="/privacy" element={<ModernLayout><Privacy /></ModernLayout>} />
            
            {/* Auth Pages */}
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/forgot-password" element={<Auth />} />
            
            {/* Protected App Pages with MobileLayout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <Index />
                  </MobileLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <TranslationApp />
                  </MobileLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <MobileLayout>
                    <Admin />
                  </MobileLayout>
                </AdminRoute>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<ModernLayout><NotFound /></ModernLayout>} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
