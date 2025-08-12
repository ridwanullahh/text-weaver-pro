
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Crown, 
  User, 
  Settings,
  Plus,
  Wallet
} from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: FileText, label: 'Translate', path: '/app' },
    { icon: Crown, label: 'Pricing', path: '/pricing' },
    { icon: User, label: 'Profile', path: '/dashboard' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleQuickAction = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to start translating documents.",
        variant: "destructive"
      });
      return;
    }
    // Navigate to translation app
    window.location.href = '/app';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleQuickAction}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
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

      {/* Wallet Balance (if authenticated) */}
      {isAuthenticated && user && (
        <motion.div
          className="fixed top-4 right-4 z-30 bg-card/95 backdrop-blur-md rounded-full px-3 py-2 border border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-sm">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">
              ${(user.walletBalance || 0).toFixed(2)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MobileLayout;
