
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: Globe, text: '100+ Languages' },
    { icon: Zap, text: 'AI-Powered' },
    { icon: Shield, text: 'Secure & Private' },
  ];

  return (
    <section className="px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Hero Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
        >
          <span className="text-primary text-sm font-medium">🚀 AI Translation Platform</span>
        </motion.div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
          Transform Documents
          <span className="block gradient-primary bg-clip-text text-transparent">
            Across Languages
          </span>
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto leading-relaxed">
          Professional AI-powered translation that preserves formatting and maintains context accuracy.
        </p>

        {/* Feature Pills */}
        <motion.div
          className="flex justify-center gap-2 mb-8 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center space-x-2 px-3 py-2 bg-card border border-border rounded-xl shadow-sm"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to={isAuthenticated ? "/app" : "/login"} className="block">
            <Button 
              size="lg" 
              className="w-full gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {isAuthenticated ? 'Start Translating' : 'Get Started Free'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          <Link to="/pricing" className="block">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-primary text-primary hover:bg-primary/5"
            >
              View Pricing
            </Button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-muted-foreground mb-2">Trusted by professionals worldwide</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full border-2 border-card flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">1000+ happy users</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
