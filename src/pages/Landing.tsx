
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu, X } from 'lucide-react';
import MobileNav from '@/components/mobile/MobileNav';
import { useAuth } from '@/hooks/useAuth';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Mobile-First Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🌐</div>
            <h1 className="text-xl md:text-2xl font-bold">TextWeaver Pro</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-white/70 hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</Link>
            <Link to="/docs" className="text-white/70 hover:text-white transition-colors">Docs</Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
          
          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight"
              >
                Unlock Global Communication with{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  TextWeaver Pro
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Translate documents, connect with global audiences, and streamline your workflow with our professional AI-powered translation platform.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to={isAuthenticated ? "/app" : "/login"} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                    Start Translating <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/features" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-white/30 hover:bg-white/5 text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="flex-1 max-w-md lg:max-w-none">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 md:p-8"
              >
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 md:p-8 text-center">
                  <div className="text-4xl md:text-6xl mb-4">🌍</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">AI-Powered Translation</h3>
                  <p className="text-white/60 text-sm md:text-base">
                    Support for 100+ languages with context-aware translation
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Grid */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              Explore the powerful features that make TextWeaver Pro the ultimate translation solution.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Translation',
                description: 'Leverage advanced AI for accurate and context-aware translations.'
              },
              {
                icon: '🌐',
                title: 'Multi-Language Support',
                description: 'Translate content into multiple languages simultaneously.'
              },
              {
                icon: '🔒',
                title: 'Secure Document Handling',
                description: 'Ensure the security and confidentiality of your documents.'
              },
              {
                icon: '📱',
                title: 'Mobile Optimized',
                description: 'Perfect experience on all devices with responsive design.'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Get translations in seconds with our optimized processing.'
              },
              {
                icon: '💰',
                title: 'Flexible Pricing',
                description: 'Pay-as-you-go pricing with transparent costs.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl mb-3 md:mb-4 text-center">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-white/70 text-sm md:text-base text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl p-6 md:p-12 border border-white/10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Translating?</h2>
            <p className="text-white/70 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust TextWeaver Pro for their translation needs.
            </p>
            <Link to={isAuthenticated ? "/app" : "/login"}>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 border-t border-white/10 px-4">
        <div className="container mx-auto text-center">
          <p className="text-white/60 text-sm md:text-base">
            &copy; 2024 TextWeaver Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
