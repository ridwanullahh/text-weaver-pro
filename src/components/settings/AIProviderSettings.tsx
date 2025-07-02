
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { aiProviderService } from '@/services/aiProviderService';
import { Bot, Key, Settings, Zap, Languages, CheckCircle, AlertCircle } from 'lucide-react';

interface ProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  isActive: boolean;
}

const AVAILABLE_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    icon: '🤖',
    description: 'Google\'s latest AI model with vision capabilities'
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    icon: '🧠',
    description: 'OpenAI\'s powerful language models'
  },
  anthropic: {
    name: 'Anthropic Claude',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    icon: '🎭',
    description: 'Anthropic\'s advanced AI assistant'
  },
  mistral: {
    name: 'Mistral AI',
    models: ['mistral-large', 'mistral-medium', 'mistral-small'],
    icon: '🌪️',
    description: 'European AI with multilingual capabilities'
  }
};

const AIProviderSettings = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Record<string, ProviderConfig>>({});
  const [extractionProvider, setExtractionProvider] = useState<string>('gemini');
  const [translationProvider, setTranslationProvider] = useState<string>('gemini');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProviderConfigs();
  }, []);

  const loadProviderConfigs = () => {
    const configs: Record<string, ProviderConfig> = {};
    
    Object.keys(AVAILABLE_PROVIDERS).forEach(provider => {
      const savedConfig = localStorage.getItem(`ai_provider_${provider}`);
      if (savedConfig) {
        configs[provider] = JSON.parse(savedConfig);
      } else {
        configs[provider] = {
          provider,
          apiKey: '',
          model: AVAILABLE_PROVIDERS[provider as keyof typeof AVAILABLE_PROVIDERS].models[0],
          enabled: false,
          isActive: provider === 'gemini'
        };
      }
    });

    setProviders(configs);
    
    // Load provider preferences
    const savedExtractionProvider = localStorage.getItem('extraction_provider') || 'gemini';
    const savedTranslationProvider = localStorage.getItem('translation_provider') || 'gemini';
    setExtractionProvider(savedExtractionProvider);
    setTranslationProvider(savedTranslationProvider);
  };

  const updateProviderConfig = (providerId: string, updates: Partial<ProviderConfig>) => {
    const updatedConfig = { ...providers[providerId], ...updates };
    const newProviders = { ...providers, [providerId]: updatedConfig };
    setProviders(newProviders);
    localStorage.setItem(`ai_provider_${providerId}`, JSON.stringify(updatedConfig));
  };

  const setActiveProvider = (providerId: string) => {
    const newProviders = { ...providers };
    Object.keys(newProviders).forEach(id => {
      newProviders[id].isActive = id === providerId;
      localStorage.setItem(`ai_provider_${id}`, JSON.stringify(newProviders[id]));
    });
    setProviders(newProviders);
    
    // Update the aiProviderService
    if (newProviders[providerId].enabled && newProviders[providerId].apiKey) {
      aiProviderService.setProvider({
        provider: providerId,
        apiKey: newProviders[providerId].apiKey,
        model: newProviders[providerId].model
      });
    }

    toast({
      title: "Active Provider Updated",
      description: `${AVAILABLE_PROVIDERS[providerId as keyof typeof AVAILABLE_PROVIDERS].name} is now the active provider.`,
    });
  };

  const testProvider = async (providerId: string) => {
    const config = providers[providerId];
    if (!config.apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key before testing.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the provider with a simple request
      const testResult = await aiProviderService.testProvider({
        provider: providerId,
        apiKey: config.apiKey,
        model: config.model
      });

      if (testResult.success) {
        updateProviderConfig(providerId, { enabled: true });
        toast({
          title: "Provider Test Successful",
          description: `${AVAILABLE_PROVIDERS[providerId as keyof typeof AVAILABLE_PROVIDERS].name} is working correctly.`,
        });
      } else {
        toast({
          title: "Provider Test Failed",
          description: testResult.error || "Failed to connect to the provider.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the provider.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProviderPreferences = () => {
    localStorage.setItem('extraction_provider', extractionProvider);
    localStorage.setItem('translation_provider', translationProvider);
    
    toast({
      title: "Preferences Saved",
      description: "Your AI provider preferences have been updated.",
    });
  };

  const getProviderStatus = (providerId: string) => {
    const config = providers[providerId];
    if (!config) return 'not-configured';
    if (!config.apiKey) return 'not-configured';
    if (!config.enabled) return 'not-tested';
    return config.isActive ? 'active' : 'ready';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Provider Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(AVAILABLE_PROVIDERS).map(([providerId, providerInfo]) => {
            const config = providers[providerId] || {};
            const status = getProviderStatus(providerId);
            
            return (
              <motion.div
                key={providerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/20 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{providerInfo.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{providerInfo.name}</h3>
                      <p className="text-white/60 text-sm">{providerInfo.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {status === 'active' && (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </div>
                    )}
                    {status === 'ready' && (
                      <div className="flex items-center gap-1 text-blue-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Ready
                      </div>
                    )}
                    {status === 'not-tested' && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Not Tested
                      </div>
                    )}
                    {status === 'not-configured' && (
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Not Configured
                      </div>
                    )}
                    
                    <Switch
                      checked={config.isActive || false}
                      onCheckedChange={() => setActiveProvider(providerId)}
                      disabled={!config.enabled}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${providerId}-api-key`} className="text-white/80">
                      API Key
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={`${providerId}-api-key`}
                        type="password"
                        placeholder="Enter API key..."
                        value={config.apiKey || ''}
                        onChange={(e) => updateProviderConfig(providerId, { apiKey: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        onClick={() => testProvider(providerId)}
                        disabled={isLoading || !config.apiKey}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 shrink-0"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`${providerId}-model`} className="text-white/80">
                      Model
                    </Label>
                    <Select
                      value={config.model || providerInfo.models[0]}
                      onValueChange={(value) => updateProviderConfig(providerId, { model: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerInfo.models.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Provider Preferences */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Provider Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Extraction Provider
              </Label>
              <Select value={extractionProvider} onValueChange={setExtractionProvider}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AVAILABLE_PROVIDERS).map(([id, info]) => (
                    <SelectItem key={id} value={id} disabled={!providers[id]?.enabled}>
                      {info.icon} {info.name}
                      {!providers[id]?.enabled && ' (Not configured)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/80 flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Translation Provider
              </Label>
              <Select value={translationProvider} onValueChange={setTranslationProvider}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AVAILABLE_PROVIDERS).map(([id, info]) => (
                    <SelectItem key={id} value={id} disabled={!providers[id]?.enabled}>
                      {info.icon} {info.name}
                      {!providers[id]?.enabled && ' (Not configured)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={saveProviderPreferences}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Save Preferences
            </Button>
          </div>

          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300">
              <Bot className="w-3 h-3 inline mr-1" />
              <strong>Fallback:</strong> If your preferred provider fails, the system will automatically fall back to Gemini for reliability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIProviderSettings;
