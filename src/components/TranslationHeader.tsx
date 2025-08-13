
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, BookOpen } from 'lucide-react';

const TranslationHeader = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center items-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-full">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4"
          >
            TextWeaver Pro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
          >
            Autonomous AI Translation Platform for Books & Documents
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 text-white/60"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>AI-Powered Translation</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Format Preservation</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              <span>100+ Languages</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default TranslationHeader;
