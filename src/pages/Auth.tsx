
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
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
          {isLogin ? <LoginForm /> : <RegisterForm />}
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
  );
};

export default Auth;
