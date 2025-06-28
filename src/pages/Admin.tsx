
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  MessageSquare, 
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Admin Components
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import InviteManagement from './admin/InviteManagement';
import ContactManagement from './admin/ContactManagement';
import BlogManagement from './admin/BlogManagement';
import DocumentationManagement from './admin/DocumentationManagement';

const Admin = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="text-center py-16 px-8">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-white/60 mb-8">You don't have permission to access the admin area.</p>
            <Link to="/app">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                Return to App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true
    },
    { 
      path: '/admin/users', 
      label: 'User Management', 
      icon: <Users className="w-5 h-5" />
    },
    { 
      path: '/admin/invites', 
      label: 'Invite Management', 
      icon: <UserPlus className="w-5 h-5" />
    },
    { 
      path: '/admin/contacts', 
      label: 'Contact Messages', 
      icon: <MessageSquare className="w-5 h-5" />
    },
    { 
      path: '/admin/blog', 
      label: 'Blog Management', 
      icon: <FileText className="w-5 h-5" />
    },
    { 
      path: '/admin/docs', 
      label: 'Documentation', 
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  const isActivePath = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-30 w-64 h-screen bg-black/40 backdrop-blur-md border-r border-white/10 transition-transform duration-300`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-white/60 text-sm">TextWeaver Pro</p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.fullName || 'Admin'}</p>
                  <p className="text-white/60 text-xs">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActivePath(item.path, item.exact)
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-6 left-6 right-6">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/invites" element={<InviteManagement />} />
              <Route path="/contacts" element={<ContactManagement />} />
              <Route path="/blog" element={<BlogManagement />} />
              <Route path="/docs" element={<DocumentationManagement />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
