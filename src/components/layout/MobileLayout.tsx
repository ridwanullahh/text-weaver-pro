
import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Crown, 
  User,
  Plus,
  Wallet,
  Menu,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppSidebar from '@/components/shared/AppSidebar';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: FileText, label: 'Translate', path: '/app' },
    { icon: Crown, label: 'Pricing', path: '/pricing' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleQuickAction = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Menu + Brand */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="text-xl">🌐</div>
                  <div>
                    <h1 className="text-sm font-bold text-foreground">TextWeaver Pro</h1>
                  </div>
                </div>
              </div>
              
              {/* Right: User Info */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
                  </Button>
                  
                  {/* Wallet Balance */}
                  <div className="hidden sm:block bg-muted rounded-full px-3 py-1.5">
                    <div className="flex items-center space-x-1 text-sm">
                      <Wallet className="w-3 h-3 text-primary" />
                      <span className="font-medium text-foreground">
                        ${(user.walletBalance || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              )}
              
              {!isAuthenticated && (
                <Button
                  onClick={() => navigate('/login')}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
            {children}
          </div>
        </main>

        {/* Floating Action Button */}
        <motion.button
          onClick={handleQuickAction}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/25 flex items-center justify-center z-20 md:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-0 ${
                  isActivePath(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{item.label}</span>
                {isActivePath(item.path) && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileLayout;
