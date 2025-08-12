
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Globe, Shield, Zap, Users, BarChart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Document Processing',
      description: 'Support for PDF, DOCX, TXT, and more file formats',
      details: ['Preserves formatting', 'Batch processing', 'OCR support']
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: 'Multi-Language Support',
      description: 'Translate to 100+ languages with high accuracy',
      details: ['Real-time translation', 'Context awareness', 'Cultural adaptation']
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Enterprise Security',
      description: 'Bank-level security for your sensitive documents',
      details: ['End-to-end encryption', 'GDPR compliant', 'SOC 2 certified']
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: 'Lightning Fast',
      description: 'Get translations in seconds, not minutes',
      details: ['AI-powered processing', 'Cloud acceleration', '99.9% uptime']
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Team Collaboration',
      description: 'Work together on translation projects',
      details: ['Real-time collaboration', 'Version control', 'Comments & reviews']
    },
    {
      icon: <BarChart className="w-8 h-8 text-primary" />,
      title: 'Analytics & Insights',
      description: 'Track your translation usage and quality',
      details: ['Usage analytics', 'Quality metrics', 'Cost tracking']
    }
  ];

  return (
    <MobileLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="px-4 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <span className="text-primary text-sm font-medium">✨ Powerful Features</span>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for
              <span className="block gradient-primary bg-clip-text text-transparent">
                Perfect Translation
              </span>
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
              Discover the advanced features that make TextWeaver the best choice for professional translation.
            </p>

            <Link to="/pricing">
              <Button size="lg" className="gradient-primary text-white shadow-lg">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="px-4">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm text-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 pb-8">
          <Card className="gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Ready to Experience These Features?
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Start your free trial today and see the difference.
              </p>
              <Link to="/login">
                <Button className="gradient-primary text-white shadow-lg">
                  Start Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </MobileLayout>
  );
};

export default Features;
