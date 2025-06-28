
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen, Globe, Zap, CheckCircle, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Multi-Format Support",
      description: "Support for PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, and EPUB files"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "100+ Languages",
      description: "Translate to and from over 100 languages with AI-powered accuracy"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Extraction",
      description: "Advanced Gemini Vision AI for perfect text extraction from complex layouts"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Manager",
      content: "TextWeaver Pro has revolutionized our localization workflow. The accuracy is incredible!",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      role: "Translator",
      content: "The AI extraction works perfectly with Arabic and English mixed documents.",
      rating: 5
    },
    {
      name: "Maria Garcia",
      role: "Publishing House",
      content: "We've translated over 500 documents with perfect results. Highly recommended!",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      features: ["3 text translations/day", "Basic file formats", "Community support"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$0.10/page",
      features: ["Unlimited translations", "All file formats", "AI extraction", "Priority support"],
      cta: "Start Translating",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Volume discounts", "API access", "Custom integrations", "Dedicated support"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">TextWeaver Pro</div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transform Documents
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {" "}Across Languages
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              AI-powered document translation platform supporting 100+ languages and multiple file formats. 
              Extract, translate, and export with unprecedented accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-white/70 text-lg">Everything you need for professional document translation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-purple-400 mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Professionals</h2>
            <p className="text-white/70 text-lg">See what our users are saying</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-white/60 text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/70 text-lg">Choose the plan that fits your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative ${plan.popular ? 'ring-2 ring-purple-500' : ''} bg-white/10 backdrop-blur-md border-white/20`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white mb-4">{plan.price}</div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-white/70">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' 
                        : 'bg-white/20 hover:bg-white/30'}`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/70 text-lg mb-8">Join thousands of professionals using TextWeaver Pro</p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">TextWeaver Pro</h3>
              <p className="text-white/60 text-sm">
                The world's most advanced document translation platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="/features" className="hover:text-white">Features</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/api" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/status" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60 text-sm">
            © 2024 TextWeaver Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
