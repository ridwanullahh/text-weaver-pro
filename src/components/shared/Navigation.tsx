
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors">
          TextWeaver Pro
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/features" 
            className={`text-sm transition-colors ${
              isActive('/features') ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className={`text-sm transition-colors ${
              isActive('/pricing') ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Pricing
          </Link>
          <Link 
            to="/blog" 
            className={`text-sm transition-colors ${
              isActive('/blog') ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Blog
          </Link>
          <Link 
            to="/docs" 
            className={`text-sm transition-colors ${
              isActive('/docs') ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Docs
          </Link>
          <Link 
            to="/contact" 
            className={`text-sm transition-colors ${
              isActive('/contact') ? 'text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/app">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Dashboard
                </Button>
              </Link>
              {user?.roles?.includes('admin') && (
                <Link to="/admin">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Admin
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
