
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import HeroSection from '@/components/home/HeroSection';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Translation',
      description: 'Advanced AI for context-aware translations with 99% accuracy.'
    },
    {
      icon: '🌐',
      title: '100+ Languages',
      description: 'Translate content into over 100 languages instantly.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with end-to-end encryption.'
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Perfect experience on all devices with responsive design.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Get translations in seconds with optimized processing.'
    },
    {
      icon: '💰',
      title: 'Flexible Pricing',
      description: 'Pay-as-you-go or subscription plans to fit your needs.'
    }
  ];

  return (
    <div className="space-y-8">
      <HeroSection />
      
      {/* Features Section */}
      <section className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Why Choose TextWeaver?
          </h2>
          <p className="text-muted-foreground">
            Experience the future of document translation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-bold text-foreground mb-6">
              Trusted by Professionals Worldwide
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                <div className="text-sm text-muted-foreground">Documents Translated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100+</div>
                <div className="text-sm text-muted-foreground">Languages Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Translation Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Join thousands of professionals who trust TextWeaver for their translation needs.
            </p>
            <div className="space-y-3">
              <Link to="/register" className="block">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing" className="block">
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Landing;
