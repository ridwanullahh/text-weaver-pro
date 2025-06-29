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
      
      toast({
        title: "Seeding Demo Data",
        description: "Creating demo users and initial data...",
      });
      
      // Create demo users with properly hashed passwords
      const demoUsers = [
        {
          id: '1',
          uid: 'demo-user-1',
          email: 'demo@textweaverpro.com',
          password: wrappedSDK.hashPassword('demo123'),
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
          password: wrappedSDK.hashPassword('admin123'),
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
        title: "Demo Data Seeded Successfully! 🎉",
        description: "Demo users created. You can now login with the provided credentials.",
      });

    } catch (error) {
      console.error('Failed to seed demo data:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to create demo data. Please check console for details.",
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
            className="bg-orange-500 hover:bg-orange-600 text-white mb-4 w-full"
          >
            {isSeeding ? 'Seeding Demo Data...' : '🌱 Seed Demo Data'}
          </Button>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-sm">
            <p className="text-white/90 font-medium mb-2">Demo Credentials:</p>
            <p className="text-white/70 text-xs">
              📧 <strong>User:</strong> demo@textweaverpro.com / demo123<br/>
              👑 <strong>Admin:</strong> admin@textweaverpro.com / admin123
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
  );
};

export default Auth;
