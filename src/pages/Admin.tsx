import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import InviteManagement from './admin/InviteManagement';
import BlogManagement from './admin/BlogManagement';
import DocumentationManagement from './admin/DocumentationManagement';
import ContactManagement from './admin/ContactManagement';
import WalletManagement from './admin/WalletManagement';
import { LogOut, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-white/60 mb-6">You don't have permission to access this area.</p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                Go Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'wallets', label: 'Wallets', icon: '💰' },
    { id: 'invites', label: 'Invites', icon: '📨' },
    { id: 'blog', label: 'Blog', icon: '📝' },
    { id: 'docs', label: 'Docs', icon: '📚' },
    { id: 'contacts', label: 'Contacts', icon: '📞' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/60 text-sm">Manage TextWeaver Pro platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </Link>
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
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 min-w-max">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{tab.icon}</span>
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
          >
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'wallets' && <WalletManagement />}
            {activeTab === 'invites' && <InviteManagement />}
            {activeTab === 'blog' && <BlogManagement />}
            {activeTab === 'docs' && <DocumentationManagement />}
            {activeTab === 'contacts' && <ContactManagement />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
