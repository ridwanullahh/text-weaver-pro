
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { toast } from '@/hooks/use-toast';

const APIKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      geminiService.setApiKey(savedKey);
      setIsValid(true);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Set the API key in the service
      geminiService.setApiKey(apiKey);
      
      // Test the API key with a simple request
      await geminiService.detectLanguage("Hello world");
      
      // Save to localStorage if valid
      localStorage.setItem('gemini_api_key', apiKey);
      setIsValid(true);
      
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been validated and saved successfully.",
      });
      
    } catch (error) {
      console.error('API key validation failed:', error);
      setIsValid(false);
      
      toast({
        title: "Invalid API Key",
        description: "The API key could not be validated. Please check and try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsValid(null);
    geminiService.setApiKey('');
    
    toast({
      title: "API Key Removed",
      description: "Your API key has been removed. Translation will use simulation mode.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Gemini API Setup</h3>
        {isValid && <CheckCircle className="w-6 h-6 text-green-400" />}
        {isValid === false && <AlertCircle className="w-6 h-6 text-red-400" />}
      </div>

      <div className="space-y-6">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium mb-2">Get Your Free Gemini API Key</p>
              <p className="text-white/80 text-sm mb-3">
                TextWeaver Pro uses Google's Gemini 2.5 Flash model for high-quality translations. 
                The free tier provides generous limits perfect for most translation needs.
              </p>
              <motion.a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <ExternalLink className="w-4 h-4" />
                Get Your API Key
              </motion.a>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white/80 font-medium mb-3">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full bg-white/5 border border-white/20 rounded-xl p-4 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <motion.button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={handleSaveApiKey}
            disabled={isValidating}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save & Validate
              </>
            )}
          </motion.button>

          {isValid && (
            <motion.button
              onClick={handleRemoveApiKey}
              className="bg-red-500/20 text-red-300 px-6 py-3 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Remove Key
            </motion.button>
          )}
        </div>

        {!apiKey && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> Without an API key, translations will run in simulation mode. 
              Add your Gemini API key for real AI-powered translations.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default APIKeySetup;
