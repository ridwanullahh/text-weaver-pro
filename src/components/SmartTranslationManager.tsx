
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Target, Settings, Info } from 'lucide-react';
import { TranslationProject } from '../types/translation';

interface SmartTranslationManagerProps {
  project: TranslationProject;
  onSettingsUpdate: (settings: any) => void;
}

const SmartTranslationManager: React.FC<SmartTranslationManagerProps> = ({ 
  project, 
  onSettingsUpdate 
}) => {
  const [smartMode, setSmartMode] = useState(true);
  const [batchSize, setBatchSize] = useState(5);
  const [priorityLanguages, setPriorityLanguages] = useState<string[]>([]);
  const [adaptiveChunking, setAdaptiveChunking] = useState(true);
  const [qualityThreshold, setQualityThreshold] = useState(85);

  const smartFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered Optimization',
      description: 'Automatically adjusts translation parameters based on content type and complexity',
      enabled: smartMode
    },
    {
      icon: Zap,
      title: 'Adaptive Rate Limiting',
      description: 'Dynamically manages API calls to maximize throughput without hitting limits',
      enabled: true
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Automatically retries low-quality translations and validates output',
      enabled: qualityThreshold > 0
    },
    {
      icon: Target,
      title: 'Priority Processing',
      description: 'Processes high-priority languages first for faster partial results',
      enabled: priorityLanguages.length > 0
    }
  ];

  const handleSmartSettingsUpdate = () => {
    const smartSettings = {
      smartMode,
      batchSize,
      priorityLanguages,
      adaptiveChunking,
      qualityThreshold,
      autoRetry: true,
      contextAwareness: true
    };
    onSettingsUpdate(smartSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-md rounded-3xl p-8 border border-purple-500/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Smart Translation Engine</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">AI Active</span>
        </div>
      </div>

      {/* Smart Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {smartFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              feature.enabled 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-gray-500/10 border-gray-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <feature.icon className={`w-5 h-5 mt-0.5 ${
                feature.enabled ? 'text-green-400' : 'text-gray-400'
              }`} />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Smart Settings */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-white font-medium">Smart Mode</label>
            <motion.button
              onClick={() => setSmartMode(!smartMode)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                smartMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: smartMode ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
          <p className="text-white/60 text-sm">
            Let AI automatically optimize translation settings for best results
          </p>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Batch Processing Size: {batchSize}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-white/60 text-xs mt-1">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Quality Threshold: {qualityThreshold}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={qualityThreshold}
            onChange={(e) => setQualityThreshold(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-white/60 text-xs mt-1">
            <span>Faster</span>
            <span>Higher Quality</span>
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Priority Languages</label>
          <div className="flex flex-wrap gap-2">
            {project.targetLanguages.map(lang => (
              <motion.button
                key={lang}
                onClick={() => {
                  setPriorityLanguages(prev => 
                    prev.includes(lang) 
                      ? prev.filter(l => l !== lang)
                      : [...prev, lang]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  priorityLanguages.includes(lang)
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {lang.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Adaptive Chunking</span>
          <motion.button
            onClick={() => setAdaptiveChunking(!adaptiveChunking)}
            className={`w-12 h-6 rounded-full transition-all duration-300 ${
              adaptiveChunking ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/20'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: adaptiveChunking ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Apply Settings Button */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <motion.button
          onClick={handleSmartSettingsUpdate}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-4 h-4" />
          Apply Smart Settings
        </motion.button>
      </div>

      {/* Info Banner */}
      <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-200 text-sm">
            Smart mode uses AI to optimize translation quality, speed, and efficiency based on your 
            content type and requirements. It automatically adjusts chunking, retry logic, and quality checks.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartTranslationManager;
