
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import WalletManager from '../components/wallet/WalletManager';
import UserDashboard from '../components/dashboard/UserDashboard';
import UserSettings from '../components/settings/UserSettings';
import MobileNav from '../components/mobile/MobileNav';
import { LogOut, Settings, Upload, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header with user info */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-xl md:text-2xl">🌐</div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">TextWeaver Pro Dashboard</h1>
                <p className="text-white/60 text-xs md:text-sm hidden sm:block">
                  Welcome back, {user?.fullName || user?.email}
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm">Wallet Balance</p>
                <p className="text-white font-bold">${user?.walletBalance.toFixed(2) || '0.00'}</p>
              </div>
              {user?.roles?.includes('admin') && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
            
            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Quick Actions */}
          <div className="mb-6 md:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              <Link to="/app">
                <motion.div
                  className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 md:p-8 text-center hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-4xl md:text-6xl mb-4">📤</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Translation App</h3>
                  <p className="text-white/60 text-sm md:text-base">
                    Upload documents and start translating
                  </p>
                </motion.div>
              </Link>
              
              <motion.div
                onClick={() => setActiveTab('wallet')}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 md:p-8 text-center hover:bg-white/15 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-4xl md:text-6xl mb-4">💰</div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Manage Wallet</h3>
                <p className="text-white/60 text-sm md:text-base">
                  Fund your account and view transactions
                </p>
              </motion.div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-6 md:mb-8 overflow-x-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 min-w-max">
              <div className="flex space-x-1 md:space-x-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap text-sm md:text-base ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm md:text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 md:px-0"
          >
            {activeTab === 'dashboard' && (
              <UserDashboard />
            )}

            {activeTab === 'settings' && (
              <UserSettings />
            )}

            {activeTab === 'wallet' && (
              <div>
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">💰 Wallet Management</h2>
                  <p className="text-white/60 text-sm md:text-lg">
                    Manage your translation credits
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <WalletManager />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
