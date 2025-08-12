
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import HeroSection from '@/components/home/HeroSection';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

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
    <MobileLayout>
      <div className="space-y-8">
        <HeroSection />
        
        {/* Features Section */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
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
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4">
          <Card className="gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">10k+</div>
                  <div className="text-xs text-muted-foreground">Documents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100+</div>
                  <div className="text-xs text-muted-foreground">Languages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Testimonials */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Loved by Professionals
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Business Manager',
                content: 'TextWeaver has revolutionized our international communications.'
              },
              {
                name: 'Ahmed Hassan',
                role: 'Content Creator',
                content: 'The accuracy and speed are unmatched. Highly recommended!'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default Landing;
