
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { initializeSDK } from "@/services/sdkService";
import { useEffect, useState } from "react";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import RequestInvite from "./pages/RequestInvite";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    initializeSDK().then(setSdkReady);
  }, []);

  if (!sdkReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Initializing TextWeaver Pro</h2>
          <p className="text-white/60">Setting up your translation workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/request-invite" element={<RequestInvite />} />
      
      {/* Protected Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  console.log('App component rendering...');
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#1a1a1a', 
        color: 'white',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>App Error</h1>
          <p>Something went wrong in the app component.</p>
        </div>
      </div>
    );
  }
};

export default App;
