
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { aiProviderService } from '../../services/aiProviderService';
import { Bot, Key, CheckCircle, AlertCircle, Settings } from 'lucide-react';

const AIProviderSettings: React.FC = () => {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const providerModels = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
  };

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = () => {
    const currentProvider = aiProviderService.getProvider();
    if (currentProvider) {
      setProvider(currentProvider.provider);
      setApiKey(currentProvider.apiKey);
      setModel(currentProvider.model);
      setIsConnected(true);
    }
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setError('');

    try {
      await aiProviderService.setProvider({
        provider,
        apiKey,
        model: model || providerModels[provider][0]
      });

      const testResult = await aiProviderService.testConnection();
      if (testResult.success) {
        setIsConnected(true);
      } else {
        setError(testResult.error || 'Connection test failed');
        setIsConnected(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    await testConnection();
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Provider Settings
          {isConnected && <Badge className="bg-green-500/20 text-green-300">Connected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            AI Provider
          </label>
          <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  OpenAI (GPT)
                </div>
              </SelectItem>
              <SelectItem value="anthropic">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Anthropic (Claude)
                </div>
              </SelectItem>
              <SelectItem value="gemini">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Google (Gemini)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Model
          </label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {providerModels[provider].map(modelName => (
                <SelectItem key={modelName} value={modelName}>
                  {modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            API Key
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 w-4 h-4 text-white/40" />
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider.toUpperCase()} API key`}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <p className="text-xs text-white/60 mt-1">
            Your API key is stored securely in your browser's local storage
          </p>
        </div>

        {/* Connection Status */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {isConnected && !error && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">Successfully connected to {provider.toUpperCase()}</span>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!apiKey.trim() || isConnecting}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isConnecting ? 'Testing Connection...' : 'Save & Test Connection'}
        </Button>

        {/* Provider Info */}
        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-300 font-medium mb-2">Getting API Keys:</h4>
          <div className="text-xs text-blue-200 space-y-1">
            {provider === 'openai' && (
              <p>Get your OpenAI API key from: <span className="font-mono">platform.openai.com/api-keys</span></p>
            )}
            {provider === 'anthropic' && (
              <p>Get your Anthropic API key from: <span className="font-mono">console.anthropic.com/settings/keys</span></p>
            )}
            {provider === 'gemini' && (
              <p>Get your Gemini API key from: <span className="font-mono">makersuite.google.com/app/apikey</span></p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProviderSettings;
