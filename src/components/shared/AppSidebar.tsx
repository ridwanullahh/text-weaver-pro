
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  FileText, 
  Crown, 
  User, 
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Wallet,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      description: 'Overview & Stats'
    },
    { 
      icon: FileText, 
      label: 'Translation Studio', 
      path: '/app',
      description: 'Translate Documents'
    },
    { 
      icon: Crown, 
      label: 'Pricing Plans', 
      path: '/pricing',
      description: 'Upgrade Your Plan'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      description: 'Account Settings'
    },
  ];

  const adminItems = user?.roles?.includes('admin') ? [
    { 
      icon: Shield, 
      label: 'Admin Panel', 
      path: '/admin',
      description: 'System Management'
    },
  ] : [];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 md:absolute md:translate-x-0 md:w-64"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">🌐</div>
                <div>
                  <h2 className="font-bold text-foreground">TextWeaver Pro</h2>
                  <p className="text-xs text-muted-foreground">Professional Translation</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="md:hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name || 'User'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {user.plan || 'free'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Wallet Balance */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Wallet className="w-3 h-3" />
                    <span>Balance</span>
                  </div>
                  <span className="font-medium text-foreground">
                    ${(user.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Admin Section */}
            {adminItems.length > 0 && (
              <div className="pt-4 space-y-1">
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                      isActivePath(item.path)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default AppSidebar;
