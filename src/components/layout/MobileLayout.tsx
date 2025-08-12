
import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  FileText, 
  Settings, 
  User,
  Menu,
  Bell,
  Search,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/app', icon: FileText, label: 'Translate' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <motion.header 
        className="mobile-header px-4 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">TW</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">TextWeaver</h1>
              {isAuthenticated && (
                <p className="text-xs text-muted-foreground">
                  Welcome back, {user?.email?.split('@')[0]}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full text-xs"></span>
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <motion.div 
          className="mt-3 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search translations..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <AnimatePresence>
        {location.pathname === '/' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/app" className="floating-action">
              <Plus className="w-6 h-6" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <motion.nav 
        className="mobile-nav px-4 py-2"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 relative"
              >
                <motion.div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 w-72 bg-card border border-border rounded-xl shadow-xl p-4 z-50"
          >
            <h3 className="font-semibold text-foreground mb-3">Notifications</h3>
            <div className="space-y-2">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">Translation completed</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">New feature available</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileLayout;
