
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Zap, Crown } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      icon: <Zap className="w-8 h-8 text-blue-400" />,
      price: { nigeria: "₦2,500", international: "$5" },
      period: "per month",
      description: "Perfect for individuals and small projects",
      features: [
        "50 pages per month",
        "5 languages supported",
        "PDF & DOCX support",
        "Basic translation quality",
        "Email support",
        "Standard processing speed"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      icon: <Star className="w-8 h-8 text-purple-400" />,
      price: { nigeria: "₦7,500", international: "$15" },
      period: "per month",
      description: "Ideal for businesses and frequent users",
      features: [
        "200 pages per month",
        "25+ languages supported",
        "All file formats",
        "AI-powered translation",
        "Priority support",
        "Fast processing",
        "Quality assessment",
        "Translation memory"
      ],
      popular: true,
      cta: "Get Started"
    },
    {
      name: "Enterprise",
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      price: { nigeria: "₦25,000", international: "$50" },
      period: "per month",
      description: "For large teams and high-volume translation",
      features: [
        "Unlimited pages",
        "100+ languages supported",
        "All file formats",
        "Premium AI translation",
        "Dedicated support",
        "Instant processing",
        "Advanced analytics",
        "Team collaboration",
        "Custom integrations",
        "SLA guarantee"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const payAsYouGo = {
    nigeria: {
      page: "₦10 per page",
      text: "₦5 per text block"
    },
    international: {
      page: "$0.10 per page",
      text: "$0.05 per text block"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              TextWeaver Pro
            </Link>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            💰 Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your Perfect
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {" "}Translation Plan
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Flexible pricing options designed to scale with your translation needs. 
            Regional pricing available for Nigerian users.
          </p>
        </motion.div>

        {/* Regional Toggle Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <span className="text-white/70">🇳🇬 Nigerian pricing available</span>
            <span className="text-white/50">|</span>
            <span className="text-white/70">🌍 International pricing</span>
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={`bg-white/10 backdrop-blur-md border-white/20 h-full ${
                plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''
              } hover:bg-white/15 transition-all duration-300`}>
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-white">
                      {plan.price.nigeria}
                      <span className="text-sm text-white/60 ml-1">NGN</span>
                    </div>
                    <div className="text-xl text-white/70">
                      {plan.price.international}
                      <span className="text-sm text-white/60 ml-1">USD</span>
                    </div>
                    <p className="text-white/60 text-sm">{plan.period}</p>
                  </div>
                  <p className="text-white/70 mt-4">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register" className="block">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                          : 'bg-white/10 hover:bg-white/20 border border-white/20'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pay-as-you-go Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white mb-4">Pay-as-you-Go</CardTitle>
              <p className="text-white/70">
                No monthly commitment. Pay only for what you translate.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-white">Nigerian Pricing</h3>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">{payAsYouGo.nigeria.page}</div>
                    <div className="text-white/60">per page translated</div>
                    <div className="text-lg text-white/80">{payAsYouGo.nigeria.text}</div>
                    <div className="text-white/60">per text block</div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-white">International Pricing</h3>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">{payAsYouGo.international.page}</div>
                    <div className="text-white/60">per page translated</div>
                    <div className="text-lg text-white/80">{payAsYouGo.international.text}</div>
                    <div className="text-white/60">per text block</div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500">
                    Start with Pay-as-you-Go
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-white/70">Got questions? We've got answers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: "Can I switch plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and local Nigerian payment methods through Paystack."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes, we offer a 7-day free trial for all new users with full access to all features."
              },
              {
                question: "What happens if I exceed my monthly limit?",
                answer: "You can either upgrade your plan or pay per additional page at standard rates."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                <h3 className="text-white font-semibold mb-3">{faq.question}</h3>
                <p className="text-white/70">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border-white/20 p-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Start Translating?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and transform your document translation workflow today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
