
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink, Settings, Plus } from 'lucide-react';
import { aiProviderService, AI_PROVIDERS, AIProvider } from '../services/aiProviderService';
import { toast } from '@/hooks/use-toast';

interface ProviderConfig {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const APIKeySetup: React.FC = () => {
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('');
  const [showSetup, setShowSetup] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ProviderConfig>({
    provider: 'gemini',
    apiKey: '',
    baseUrl: '',
    model: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const savedConfigs = localStorage.getItem('ai_provider_configs');
    const savedActive = localStorage.getItem('active_ai_provider');
    
    if (savedConfigs) {
      const parsedConfigs = JSON.parse(savedConfigs);
      setConfigs(parsedConfigs);
    }
    
    if (savedActive) {
      setActiveProvider(savedActive);
    }
    
    // Load current provider config
    const currentProviderConfig = aiProviderService.getProvider();
    if (currentProviderConfig) {
      setActiveProvider(currentProviderConfig.provider);
    }
  };

  const handleSaveConfig = async () => {
    if (!currentConfig.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key.",
        variant: "destructive"
      });
      return;
    }

    if (currentConfig.provider === 'custom' && !currentConfig.baseUrl.trim()) {
      toast({
        title: "Base URL Required",
        description: "Please enter the base URL for your custom provider.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Set the provider config
      aiProviderService.setProvider(currentConfig);
      
      // Test with a simple request
      await aiProviderService.detectLanguage("Hello world");
      
      // Save to localStorage
      const updatedConfigs = configs.filter(c => c.provider !== currentConfig.provider);
      updatedConfigs.push(currentConfig);
      setConfigs(updatedConfigs);
      localStorage.setItem('ai_provider_configs', JSON.stringify(updatedConfigs));
      localStorage.setItem('active_ai_provider', currentConfig.provider);
      setActiveProvider(currentConfig.provider);
      
      setShowSetup(false);
      setCurrentConfig({ provider: 'gemini', apiKey: '', baseUrl: '', model: '' });
      
      toast({
        title: "Provider Configured",
        description: `${AI_PROVIDERS.find(p => p.id === currentConfig.provider)?.name} has been configured successfully.`,
      });
      
    } catch (error) {
      console.error('Provider validation failed:', error);
      
      toast({
        title: "Configuration Failed",
        description: "The provider configuration could not be validated. Please check your settings.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSetActiveProvider = (providerId: string) => {
    const config = configs.find(c => c.provider === providerId);
    if (config) {
      aiProviderService.setProvider(config);
      setActiveProvider(providerId);
      localStorage.setItem('active_ai_provider', providerId);
      
      toast({
        title: "Provider Switched",
        description: `Now using ${AI_PROVIDERS.find(p => p.id === providerId)?.name} for translations.`,
      });
    }
  };

  const handleRemoveConfig = (providerId: string) => {
    const updatedConfigs = configs.filter(c => c.provider !== providerId);
    setConfigs(updatedConfigs);
    localStorage.setItem('ai_provider_configs', JSON.stringify(updatedConfigs));
    
    if (activeProvider === providerId) {
      setActiveProvider('');
      localStorage.removeItem('active_ai_provider');
      aiProviderService.setProvider({ provider: '', apiKey: '' });
    }
    
    toast({
      title: "Provider Removed",
      description: "The provider configuration has been removed.",
    });
  };

  const getProviderInfo = (providerId: string) => {
    return AI_PROVIDERS.find(p => p.id === providerId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-white">AI Provider Setup</h3>
          {activeProvider && <CheckCircle className="w-6 h-6 text-green-400" />}
        </div>
        
        <motion.button
          onClick={() => setShowSetup(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </motion.button>
      </div>

      {/* Configured Providers */}
      {configs.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="text-white/80 font-medium">Configured Providers</h4>
          {configs.map((config) => {
            const provider = getProviderInfo(config.provider);
            const isActive = activeProvider === config.provider;
            
            return (
              <div
                key={config.provider}
                className={`bg-white/5 border rounded-2xl p-4 ${
                  isActive ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isActive && <CheckCircle className="w-5 h-5 text-green-400" />}
                    <div>
                      <h5 className="text-white font-medium">{provider?.name}</h5>
                      <p className="text-white/60 text-sm">
                        Model: {config.model || provider?.defaultModel}
                      </p>
                      {config.baseUrl && (
                        <p className="text-white/60 text-sm">URL: {config.baseUrl}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <motion.button
                        onClick={() => handleSetActiveProvider(config.provider)}
                        className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm hover:bg-blue-500/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                      >
                        Set Active
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleRemoveConfig(config.provider)}
                      className="bg-red-500/20 text-red-300 px-3 py-1 rounded-lg text-sm hover:bg-red-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Setup Form */}
      {showSetup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/20 rounded-2xl p-6"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-medium mb-3">
                Select Provider
              </label>
              <select
                value={currentConfig.provider}
                onChange={(e) => setCurrentConfig({ ...currentConfig, provider: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AI_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id} className="bg-gray-800 text-white">
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-3">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={currentConfig.apiKey}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, apiKey: e.target.value })}
                  placeholder="Enter your API key..."
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-4 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            {/* Model Selection for All Providers */}
            <div>
              <label className="block text-white/80 font-medium mb-3">
                Model {currentConfig.provider !== 'custom' && '(Optional)'}
              </label>
              {getProviderInfo(currentConfig.provider)?.supportedModels ? (
                <select
                  value={currentConfig.model || ''}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, model: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-800 text-white">
                    Default ({getProviderInfo(currentConfig.provider)?.defaultModel})
                  </option>
                  {getProviderInfo(currentConfig.provider)?.supportedModels?.map(model => (
                    <option key={model} value={model} className="bg-gray-800 text-white">
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentConfig.model || ''}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, model: e.target.value })}
                  placeholder={getProviderInfo(currentConfig.provider)?.defaultModel || 'Enter model name...'}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {(currentConfig.provider === 'custom' || currentConfig.provider === 'openai' || currentConfig.provider === 'chutes') && (
              <div>
                <label className="block text-white/80 font-medium mb-3">
                  Base URL {currentConfig.provider === 'custom' && '(Required)'}
                </label>
                <input
                  type="text"
                  value={currentConfig.baseUrl || ''}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, baseUrl: e.target.value })}
                  placeholder={getProviderInfo(currentConfig.provider)?.baseUrl || 'https://api.example.com/v1'}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                onClick={handleSaveConfig}
                disabled={isValidating}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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

              <motion.button
                onClick={() => setShowSetup(false)}
                className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <div className="mt-6 space-y-4">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium mb-2">Supported Providers</p>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• <strong>Google Gemini:</strong> Free tier with 10 requests/minute (uses Gemini 1.5 Flash by default)</li>
                <li>• <strong>OpenAI:</strong> Requires paid account, 60 requests/minute</li>
                <li>• <strong>Chutes AI:</strong> Alternative provider with competitive rates</li>
                <li>• <strong>Custom:</strong> Any OpenAI-compatible API endpoint</li>
              </ul>
            </div>
          </div>
        </div>

        {!activeProvider && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> Configure at least one AI provider to enable translations.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default APIKeySetup;
