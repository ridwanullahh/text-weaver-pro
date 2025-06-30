import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="lg:flex items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-5xl font-bold mb-6"
              >
                Unlock Global Communication with TextWeaver Pro
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-lg text-white/70 mb-8"
              >
                Translate documents, connect with global audiences, and streamline your workflow with our professional translation platform.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="flex space-x-4"
              >
                <Link to="/app">
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    Start Translating <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" className="border-white/30 hover:bg-white/5">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.img
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                src="/images/hero-image.svg"
                alt="TextWeaver Pro Interface"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-white/60 text-lg">
              Explore the powerful features that make TextWeaver Pro the ultimate translation solution.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards - Replace with actual feature components */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-2">AI-Powered Translation</h3>
              <p className="text-white/70">Leverage advanced AI for accurate and context-aware translations.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-2">Multi-Language Support</h3>
              <p className="text-white/70">Translate content into multiple languages simultaneously.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-2">Secure Document Handling</h3>
              <p className="text-white/70">Ensure the security and confidentiality of your documents.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-white/60 text-lg">
              Choose the plan that fits your needs and budget.
            </p>
          </motion.div>
          {/* Pricing Cards - Replace with actual pricing components */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 w-96 text-center"
            >
              <h3 className="text-2xl font-semibold mb-4">Basic</h3>
              <div className="text-5xl font-bold mb-4">$19</div>
              <p className="text-white/70 mb-6">Ideal for small projects and personal use.</p>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 w-full">
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-white/60">
          <p>&copy; 2024 TextWeaver Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
