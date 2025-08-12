
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="mobile-header px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswordReset(false)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Reset Password</h1>
            <div></div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="mobile-header px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="text-xl">🌐</div>
            <h1 className="text-lg font-bold text-foreground">TextWeaver Pro</h1>
          </div>
          <div></div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to your account' : 'Join TextWeaver Pro today'}
            </p>
          </div>

          {/* Auth Toggle */}
          <div className="bg-muted/50 rounded-xl p-1 border border-border">
            <div className="flex">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  isLogin
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  !isLogin
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
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
            <div className="text-center">
              <Link 
                to="/request-invite" 
                className="text-primary hover:text-primary/80 text-sm underline"
              >
                Need help? Request support
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
