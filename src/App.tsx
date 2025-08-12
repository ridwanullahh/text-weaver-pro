
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { initializeSDK } from './services/sdkService';
import MobileLayout from './components/layout/MobileLayout';
import PageLayout from './components/shared/PageLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Index from './pages/Index';
import TranslationApp from './pages/TranslationApp';
import Admin from './pages/Admin';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogSingle from './pages/BlogSingle';
import Documentation from './pages/Documentation';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RequestInvite from './pages/RequestInvite';
import NotFound from './pages/NotFound';
import './App.css';

// Initialize SDK
initializeSDK().then(() => {
  console.log('SDK initialized successfully');
}).catch(error => {
  console.error('SDK initialization failed:', error);
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-foreground">Loading...</h2>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-foreground">Loading...</h2>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />;
};

const PublicPageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <PageLayout>{children}</PageLayout>;
};

const AppPageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <MobileLayout>{children}</MobileLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen">
          <Routes>
            {/* Public Routes with PageLayout */}
            <Route path="/" element={<PublicPageWrapper><Landing /></PublicPageWrapper>} />
            <Route path="/features" element={<PublicPageWrapper><Features /></PublicPageWrapper>} />
            <Route path="/pricing" element={<PublicPageWrapper><Pricing /></PublicPageWrapper>} />
            <Route path="/blog" element={<PublicPageWrapper><Blog /></PublicPageWrapper>} />
            <Route path="/blog/:slug" element={<PublicPageWrapper><BlogSingle /></PublicPageWrapper>} />
            <Route path="/docs" element={<PublicPageWrapper><Documentation /></PublicPageWrapper>} />
            <Route path="/documentation" element={<PublicPageWrapper><Documentation /></PublicPageWrapper>} />
            <Route path="/contact" element={<PublicPageWrapper><Contact /></PublicPageWrapper>} />
            <Route path="/terms" element={<PublicPageWrapper><Terms /></PublicPageWrapper>} />
            <Route path="/privacy" element={<PublicPageWrapper><Privacy /></PublicPageWrapper>} />
            <Route path="/request-invite" element={<PublicPageWrapper><RequestInvite /></PublicPageWrapper>} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<AuthRedirect />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<AuthRedirect />} />
            <Route path="/signup" element={<AuthRedirect />} />
            
            {/* Protected App Routes with MobileLayout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppPageWrapper><Index /></AppPageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <AppPageWrapper><TranslationApp /></AppPageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AppPageWrapper><Admin /></AppPageWrapper>
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy Routes */}
            <Route path="/index" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<PublicPageWrapper><NotFound /></PublicPageWrapper>} />
          </Routes>
          
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
