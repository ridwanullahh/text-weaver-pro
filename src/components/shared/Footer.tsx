
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Twitter, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TextWeaver Pro</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Professional AI-powered document translation service with format preservation and high accuracy. Transform your global communication.
            </p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-destructive fill-current" />
              <span>for global communication</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold">Product</h3>
            <div className="space-y-3">
              <Link 
                to="/features" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/docs" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Documentation
              </Link>
              <Link 
                to="/app" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Translation Studio
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold">Company</h3>
            <div className="space-y-3">
              <Link 
                to="/blog" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Contact
              </Link>
              <Link 
                to="/terms" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/privacy" 
                className="block text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold">Connect</h3>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="View our GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="mailto:support@textweaverpro.com" 
                className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
            
            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Stay updated</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2024 TextWeaver Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-muted-foreground">Powered by AI</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
