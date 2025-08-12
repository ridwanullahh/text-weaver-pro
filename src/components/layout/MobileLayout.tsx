
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Crown, 
  User, 
  Settings,
  Plus,
  Wallet,
  Menu,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: FileText, label: 'Translate', path: '/app' },
    { icon: Crown, label: 'Pricing', path: '/pricing' },
    { icon: User, label: 'Profile', path: '/dashboard' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleQuickAction = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navigate to translation app
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="mobile-header px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌐</div>
            <div>
              <h1 className="text-lg font-bold text-foreground">TextWeaver Pro</h1>
              <p className="text-xs text-muted-foreground">Professional Translation</p>
            </div>
          </div>
          
          {isAuthenticated && user && (
            <div className="flex items-center space-x-3">
              {/* Wallet Balance */}
              <div className="bg-card rounded-full px-3 py-1 border border-border">
                <div className="flex items-center space-x-1 text-sm">
                  <Wallet className="w-3 h-3 text-primary" />
                  <span className="font-medium text-foreground">
                    ${(user.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* User Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {!isAuthenticated && (
            <Button
              onClick={() => navigate('/login')}
              size="sm"
              className="gradient-primary text-primary-foreground"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4">
        {children}
      </main>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleQuickAction}
        className="floating-action"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="mobile-nav py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                isActivePath(item.path)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
