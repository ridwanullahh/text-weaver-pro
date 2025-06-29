
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { initializeSDK } from '@/services/sdkService';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/shared/PageLayout';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const seedDemoData = async () => {
    try {
      setIsSeeding(true);
      
      toast({
        title: "Initializing Database",
        description: "Setting up demo data and validating GitHub connection...",
      });
      
      await initializeSDK();
      
      toast({
        title: "Database Initialized Successfully! 🎉",
        description: "Demo users created and GitHub database is ready.",
      });

    } catch (error) {
      console.error('Failed to initialize database:', error);
      toast({
        title: "Database Initialization Failed",
        description: error instanceof Error ? error.message : "Please check your GitHub configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (showPasswordReset) {
    return (
      <PageLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link to="/" className="text-3xl font-bold text-white mb-2 block">
                TextWeaver Pro
              </Link>
              <p className="text-white/60">Reset Your Password</p>
            </div>

            <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter={false}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold text-white mb-2 block">
              TextWeaver Pro
            </Link>
            <p className="text-white/60">Professional Document Translation</p>
          </div>

          {/* Database Initialize Button */}
          <div className="mb-6 text-center">
            <Button
              onClick={seedDemoData}
              disabled={isSeeding}
              className="bg-green-600 hover:bg-green-700 text-white mb-4 w-full"
            >
              {isSeeding ? 'Initializing Database...' : '🚀 Initialize Database'}
            </Button>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-sm">
              <p className="text-white/90 font-medium mb-2">Demo Credentials:</p>
              <p className="text-white/70 text-xs">
                📧 <strong>User:</strong> demo@textweaverpro.com / demo123<br/>
                👑 <strong>Admin:</strong> admin@textweaverpro.com / admin123<br/>
                🎫 <strong>Invite Code:</strong> WELCOME2024
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLogin ? (
              <LoginForm onForgotPassword={() => setShowPasswordReset(true)} />
            ) : (
              <RegisterForm />
            )}
          </motion.div>

          {!isLogin && (
            <div className="mt-6 text-center">
              <Link 
                to="/request-invite" 
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Don't have an invitation code? Request one here
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
