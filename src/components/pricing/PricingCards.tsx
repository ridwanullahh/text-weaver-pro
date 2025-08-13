
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const PricingCards = () => {
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      icon: <Zap className="w-6 h-6 text-primary" />,
      price: { monthly: 9.99, annual: 99.99 },
      description: 'Perfect for individuals and small projects',
      features: [
        '50 pages per month',
        '10 languages supported',
        'PDF & DOCX support',
        'Standard quality',
        'Email support',
      ],
      popular: false,
      color: 'border-border',
      bgColor: 'bg-card',
    },
    {
      id: 'pro',
      name: 'Professional',
      icon: <Star className="w-6 h-6 text-accent" />,
      price: { monthly: 29.99, annual: 299.99 },
      description: 'Best for professionals and businesses',
      features: [
        '500 pages per month',
        '50+ languages supported',
        'All file formats',
        'Premium AI quality',
        'Priority support',
        'Advanced formatting',
        'Batch processing',
      ],
      popular: true,
      color: 'border-accent',
      bgColor: 'bg-gradient-to-br from-accent/5 to-primary/5',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: <Crown className="w-6 h-6 text-primary" />,
      price: { monthly: 99.99, annual: 999.99 },
      description: 'Unlimited power for large teams',
      features: [
        'Unlimited pages',
        '100+ languages',
        'All premium features',
        'Custom integrations',
        'Dedicated support',
        'Team collaboration',
        'Advanced analytics',
        'SLA guarantee',
      ],
      popular: false,
      color: 'border-primary',
      bgColor: 'bg-gradient-to-br from-primary/5 to-accent/5',
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      // This would integrate with your existing monetization service
      console.log(`Upgrading to ${planId} plan`);
      // You can implement the actual subscription logic here
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const getCurrentPlan = () => {
    // Use the plan property from User interface
    return user?.plan || 'free';
  };

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-primary mr-2" />
          <span className="text-primary text-sm font-medium">Choose Your Plan</span>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground">
          Start free, upgrade as you grow
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="flex items-center bg-muted rounded-xl p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              billingCycle === 'annual'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
            <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground px-1 py-0 text-xs">
              Save 17%
            </Badge>
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-accent text-accent-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <Card className={`${plan.color} ${plan.bgColor} ${plan.popular ? 'ring-2 ring-accent/20' : ''} transition-all duration-300 hover:shadow-lg`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {plan.icon}
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  {getCurrentPlan() === plan.id.toLowerCase() && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full ${
                    plan.popular
                      ? 'gradient-primary text-white shadow-lg shadow-primary/25'
                      : getCurrentPlan() === plan.id.toLowerCase()
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'border-primary text-primary hover:bg-primary/5'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={getCurrentPlan() === plan.id.toLowerCase()}
                >
                  {getCurrentPlan() === plan.id.toLowerCase()
                    ? 'Current Plan'
                    : isAuthenticated
                    ? `Upgrade to ${plan.name}`
                    : 'Get Started'
                  }
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pay-as-you-go Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-muted/50 to-primary/5 border-dashed border-primary/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Pay-as-you-Go
            </h3>
            <p className="text-muted-foreground mb-4">
              No monthly commitment. Perfect for occasional use.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span className="text-foreground font-medium">$0.10 per page</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground font-medium">$0.05 per text block</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PricingCards;
