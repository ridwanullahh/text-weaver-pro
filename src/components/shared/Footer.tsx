
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-white">TextWeaver Pro</span>
            </div>
            <p className="text-white/60 text-sm">
              Professional AI-powered document translation service with format preservation and high accuracy.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Product</h3>
            <div className="space-y-2">
              <Link to="/features" className="block text-white/60 hover:text-white text-sm transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="block text-white/60 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
              <Link to="/docs" className="block text-white/60 hover:text-white text-sm transition-colors">
                Documentation
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Company</h3>
            <div className="space-y-2">
              <Link to="/blog" className="block text-white/60 hover:text-white text-sm transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="block text-white/60 hover:text-white text-sm transition-colors">
                Contact
              </Link>
              <Link to="/terms" className="block text-white/60 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="block text-white/60 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:support@textweaverpro.com" className="text-white/60 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © 2024 TextWeaver Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
