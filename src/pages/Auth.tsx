
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { wrappedSDK } from '@/services/sdkService';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const seedDemoData = async () => {
    try {
      setIsSeeding(true);
      
      // Create demo users directly
      const demoUsers = [
        {
          id: '1',
          uid: 'demo-user-1',
          email: 'demo@textweaverpro.com',
          password: '3a5f6819-dc3f-4b2a-9d8e-1c7b9e4f2a8d$NjQzZTZkNzA2ZjJkNzQ2NTc4NzQ3NzY1NjE3NjY1NzI3MDcyNmYyZTYzNmY2ZDNhNWY2ODE5MmQ2NDYzMzM2NjJkMzRiMzJhMmQ5NjQ4ZTJkMzE2Mzc2Mzk2NTM0NjYzMmE4NjQ=',
          fullName: 'Demo User',
          verified: true,
          roles: ['user'],
          permissions: [],
          walletBalance: 50,
          dailyTextTranslations: 0,
          lastResetDate: new Date().toDateString(),
          isActive: true
        },
        {
          id: '2',
          uid: 'admin-user-1',
          email: 'admin@textweaverpro.com',
          password: '7b2c8f91-e4a5-4d6b-9c3e-2f8a1b5d9c7e$NjE2NDZkNjk2ZTMxMzIzMzdhMmM4ZjkxMmQ2NTRhMzUyZDRkMzY2MjJkMzk2MzMzNjUyZDJmMzg2MTMxNjIzNTY0Mzk2Mzc2NTMwNzM2MzY4NjI2NDJkMzEzMjMzMzc2MjJkMzY2MzJkMzg2NzZlNjU2ZjJkNDQ2NDJk',
          fullName: 'Admin User',
          verified: true,
          roles: ['admin', 'user'],
          permissions: ['manage_users', 'manage_content'],
          walletBalance: 100,
          dailyTextTranslations: 0,
          lastResetDate: new Date().toDateString(),
          isActive: true
        }
      ];

      // Try to insert users
      for (const user of demoUsers) {
        try {
          await wrappedSDK.insert('users', user);
        } catch (error) {
          console.log('User already exists or error inserting:', error);
        }
      }

      // Seed invite codes
      const inviteCodes = [
        {
          id: '1',
          uid: 'invite-1',
          code: 'WELCOME2024',
          used: false,
          createdBy: 'system',
          createdFor: 'public',
          usedBy: '',
          createdAt: new Date().toISOString()
        }
      ];

      for (const code of inviteCodes) {
        try {
          await wrappedSDK.insert('invite_codes', code);
        } catch (error) {
          console.log('Invite code already exists or error inserting:', error);
        }
      }

      toast({
        title: "Demo Data Seeded",
        description: "Demo users created successfully. Try logging in now.",
      });

    } catch (error) {
      console.error('Failed to seed demo data:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to create demo data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (showPasswordReset) {
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
            <p className="text-white/60">Reset Your Password</p>
          </div>

          <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
        </div>
      </div>
    );
  }

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

        {/* Demo Seed Button */}
        <div className="mb-6 text-center">
          <Button
            onClick={seedDemoData}
            disabled={isSeeding}
            className="bg-orange-500 hover:bg-orange-600 text-white mb-4"
          >
            {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
          </Button>
          <p className="text-white/40 text-xs">
            Demo: demo@textweaverpro.com / demo123<br/>
            Admin: admin@textweaverpro.com / admin123
          </p>
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
  );
};

export default Auth;
