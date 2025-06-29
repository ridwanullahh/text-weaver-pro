
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/shared/PageLayout';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

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
                Need help? Request support
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
