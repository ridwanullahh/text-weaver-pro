
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Zap, 
  Globe, 
  Shield, 
  BarChart3, 
  Clock,
  CheckCircle,
  Star,
  Users,
  Cog,
  Download,
  Eye
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "AI-Powered Translation",
      description: "Advanced neural networks deliver human-quality translations with contextual understanding.",
      benefits: ["99.5% accuracy rate", "Context-aware processing", "Continuous learning"]
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      title: "Multi-Format Support",
      description: "Handle PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, and EPUB files seamlessly.",
      benefits: ["10+ file formats", "Preserve formatting", "Batch processing"]
    },
    {
      icon: <Globe className="w-8 h-8 text-green-400" />,
      title: "100+ Languages",
      description: "Translate between over 100 languages and dialects with professional quality.",
      benefits: ["Global coverage", "Dialect support", "Bidirectional translation"]
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with international data protection standards.",
      benefits: ["End-to-end encryption", "GDPR compliant", "SOC2 certified"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-red-400" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into translation projects, quality metrics, and usage patterns.",
      benefits: ["Real-time metrics", "Quality scoring", "Usage analytics"]
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-400" />,
      title: "Real-Time Processing",
      description: "Watch your documents being translated in real-time with live progress updates.",
      benefits: ["Live progress", "Instant updates", "Quick turnaround"]
    }
  ];

  const advancedFeatures = [
    {
      icon: <Eye className="w-6 h-6 text-cyan-400" />,
      title: "Live Translation Viewer",
      description: "Watch translations happen in real-time"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: "Quality Assessment",
      description: "Automated quality scoring and suggestions"
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      title: "Team Collaboration",
      description: "Share projects and collaborate with team members"
    },
    {
      icon: <Cog className="w-6 h-6 text-gray-400" />,
      title: "Custom Settings",
      description: "Fine-tune translation parameters for your needs"
    },
    {
      icon: <Download className="w-6 h-6 text-indigo-400" />,
      title: "Export Options",
      description: "Multiple export formats and delivery methods"
    }
  ];

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
            ✨ Features Overview
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {" "}Modern Translation
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Discover why thousands of businesses trust TextWeaver Pro for their document translation needs.
            From AI-powered accuracy to enterprise-grade security, we've got you covered.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                  <p className="text-white/70">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white/80 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Advanced Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Capabilities</h2>
            <p className="text-white/70 text-lg">
              Professional tools designed for enterprise-level translation workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10 text-center p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mb-16"
        >
          <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border-white/20 p-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Translation Workflow?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have revolutionized their document translation process with TextWeaver Pro.
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

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { number: "99.5%", label: "Translation Accuracy" },
            { number: "100+", label: "Supported Languages" },
            { number: "10M+", label: "Documents Translated" },
            { number: "24/7", label: "Customer Support" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
