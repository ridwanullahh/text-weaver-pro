
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Globe, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star,
  ArrowRight,
  Users,
  Clock,
  Award
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multi-Format Support",
      description: "Support for PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, and EPUB files"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "100+ Languages",
      description: "Professional translation to over 100 languages with AI-powered accuracy"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and secure processing for your sensitive documents"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Advanced AI and traditional extraction methods for optimal speed and accuracy"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Manager",
      company: "Global Corp",
      content: "TextWeaver Pro has revolutionized our document translation workflow. The accuracy is incredible!",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      role: "Translator",
      company: "Language Solutions",
      content: "The best translation platform I've used. The AI extraction is game-changing for complex documents.",
      rating: 5
    },
    {
      name: "Maria Garcia",
      role: "Project Manager",
      company: "International NGO",
      content: "Saves us hours every week. The multi-format support is exactly what we needed.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">TextWeaver Pro</div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-white/70 hover:text-white">Features</Link>
            <Link to="/pricing" className="text-white/70 hover:text-white">Pricing</Link>
            <Link to="/docs" className="text-white/70 hover:text-white">Docs</Link>
            <Link to="/blog" className="text-white/70 hover:text-white">Blog</Link>
            <Link to="/contact" className="text-white/70 hover:text-white">Contact</Link>
            <Link to="/login">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Professional Document
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {" "}Translation
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Transform your documents with AI-powered translation. Support for 100+ languages, 
              multiple file formats, and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
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
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose TextWeaver Pro?</h2>
            <p className="text-white/70 text-lg">Advanced features designed for professional translation workflows</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
                  <CardHeader>
                    <div className="text-purple-400 mb-2">{feature.icon}</div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/70 text-lg">Pay only for what you use, with regional pricing</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Free Tier</CardTitle>
                <div className="text-3xl font-bold text-white">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />3 text translations daily</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Basic file formats</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Community support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-white">Pay Per Use</CardTitle>
                <div className="text-3xl font-bold text-white">$0.10</div>
                <p className="text-white/70">per page</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Document pages: $0.10</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Text translations: $0.05</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />All file formats</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Priority support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Nigeria Pricing</CardTitle>
                <div className="text-3xl font-bold text-white">₦10</div>
                <p className="text-white/70">per page</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Document pages: ₦10</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Text translations: ₦5</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Local payment methods</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 mr-2" />Regional support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Professionals</h2>
            <p className="text-white/70 text-lg">See what our users say about TextWeaver Pro</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-white/60 text-sm">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Translation Workflow?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust TextWeaver Pro for their document translation needs.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                Get Started Today <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">TextWeaver Pro</h3>
              <p className="text-white/60">Professional document translation powered by AI</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/docs">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 TextWeaver Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
