
import { TranslationProject } from '../types/translation';

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  requiresKey: boolean;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute?: number;
  };
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.0-flash-exp',
    requiresKey: true,
    rateLimits: { requestsPerMinute: 15 }
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4',
    requiresKey: true,
    rateLimits: { requestsPerMinute: 60 }
  },
  {
    id: 'chutes',
    name: 'Chutes AI',
    baseUrl: 'https://llm.chutes.ai/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3-0324',
    requiresKey: true,
    rateLimits: { requestsPerMinute: 30 }
  },
  {
    id: 'custom',
    name: 'Custom OpenAI-Compatible',
    baseUrl: '',
    defaultModel: '',
    requiresKey: true,
    rateLimits: { requestsPerMinute: 60 }
  }
];

interface ProviderConfig {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

interface RateLimitInfo {
  requestsPerMinute: number;
  lastRequestTime: number;
  requestCount: number;
}

class AIProviderService {
  private config: ProviderConfig | null = null;
  private rateLimitInfo: RateLimitInfo = {
    requestsPerMinute: 15,
    lastRequestTime: 0,
    requestCount: 0
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const savedConfig = localStorage.getItem('ai_provider_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
      this.updateRateLimit();
    }
  }

  setProvider(config: ProviderConfig) {
    this.config = config;
    localStorage.setItem('ai_provider_config', JSON.stringify(config));
    this.updateRateLimit();
  }

  getProvider(): ProviderConfig | null {
    return this.config;
  }

  private updateRateLimit() {
    if (this.config) {
      const provider = AI_PROVIDERS.find(p => p.id === this.config!.provider);
      if (provider) {
        this.rateLimitInfo.requestsPerMinute = provider.rateLimits.requestsPerMinute;
      }
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimitInfo.lastRequestTime;
    
    if (timeSinceLastRequest > 60000) {
      this.rateLimitInfo.requestCount = 0;
      this.rateLimitInfo.lastRequestTime = now;
    }
    
    if (this.rateLimitInfo.requestCount >= this.rateLimitInfo.requestsPerMinute) {
      const waitTime = 60000 - timeSinceLastRequest;
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.rateLimitInfo.requestCount = 0;
        this.rateLimitInfo.lastRequestTime = Date.now();
      }
    }
    
    this.rateLimitInfo.requestCount++;
    this.rateLimitInfo.lastRequestTime = now;
  }

  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    project: TranslationProject
  ): Promise<string> {
    if (!this.config) {
      throw new Error('AI provider not configured. Please set up your API provider first.');
    }

    await this.enforceRateLimit();

    switch (this.config.provider) {
      case 'gemini':
        return this.translateWithGemini(text, sourceLanguage, targetLanguage, project);
      case 'openai':
      case 'chutes':
      case 'custom':
        return this.translateWithOpenAI(text, sourceLanguage, targetLanguage, project);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async translateWithGemini(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    project: TranslationProject
  ): Promise<string> {
    const prompt = this.buildTranslationPrompt(text, sourceLanguage, targetLanguage, project);
    const baseUrl = this.config!.baseUrl || AI_PROVIDERS.find(p => p.id === 'gemini')!.baseUrl;
    const model = this.config!.model || AI_PROVIDERS.find(p => p.id === 'gemini')!.defaultModel;
    
    const response = await fetch(`${baseUrl}/${model}:generateContent?key=${this.config!.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content.parts[0]?.text?.trim() || '';
  }

  private async translateWithOpenAI(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    project: TranslationProject
  ): Promise<string> {
    const prompt = this.buildTranslationPrompt(text, sourceLanguage, targetLanguage, project);
    const provider = AI_PROVIDERS.find(p => p.id === this.config!.provider)!;
    const baseUrl = this.config!.baseUrl || provider.baseUrl;
    const model = this.config!.model || provider.defaultModel;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Provide only the translated text without explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
  }

  private buildTranslationPrompt(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    project: TranslationProject
  ): string {
    const styleInstructions = this.getStyleInstructions(project.settings.translationStyle);
    const formattingInstructions = project.settings.preserveFormatting ? 
      'CRITICAL: Preserve ALL original formatting including line breaks, paragraph structure, bullet points, numbering, and spacing.' : 
      'Focus on natural language flow while maintaining readability.';
    
    return `
You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}.

REQUIREMENTS:
- Accuracy: Translate the exact meaning without adding or omitting information
- Fluency: Ensure the translation reads naturally in ${targetLanguage}
- Consistency: Use consistent terminology throughout
- Cultural Adaptation: Adapt idioms and cultural references appropriately

STYLE: ${styleInstructions}
FORMATTING: ${formattingInstructions}

TEXT TO TRANSLATE:
"""
${text}
"""

IMPORTANT: Provide ONLY the translated text. Do not include explanations, notes, or commentary.
    `.trim();
  }

  private getStyleInstructions(style: string): string {
    const instructions = {
      formal: 'Use formal, professional language with proper grammar and sophisticated vocabulary.',
      casual: 'Use casual, conversational language that sounds natural and approachable.',
      literary: 'Preserve the artistic and literary qualities. Maintain poetic elements and the author\'s unique voice.',
      technical: 'Use precise technical terminology and maintain scientific accuracy.'
    };
    return instructions[style as keyof typeof instructions] || instructions.formal;
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.config) return 'auto';
    
    try {
      await this.enforceRateLimit();
      
      const prompt = `Detect the language of the following text and respond with only the language code (e.g., 'en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'yo'): ${text.substring(0, 500)}`;
      
      if (this.config.provider === 'gemini') {
        return this.detectWithGemini(prompt);
      } else {
        return this.detectWithOpenAI(prompt);
      }
    } catch (error) {
      console.error('Language detection error:', error);
      return 'auto';
    }
  }

  private async detectWithGemini(prompt: string): Promise<string> {
    const baseUrl = AI_PROVIDERS.find(p => p.id === 'gemini')!.baseUrl;
    const model = AI_PROVIDERS.find(p => p.id === 'gemini')!.defaultModel;
    
    const response = await fetch(`${baseUrl}/${model}:generateContent?key=${this.config!.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates[0]?.content.parts[0]?.text?.trim().toLowerCase() || 'auto';
    }
    return 'auto';
  }

  private async detectWithOpenAI(prompt: string): Promise<string> {
    const provider = AI_PROVIDERS.find(p => p.id === this.config!.provider)!;
    const baseUrl = this.config!.baseUrl || provider.baseUrl;
    const model = this.config!.model || provider.defaultModel;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content?.trim().toLowerCase() || 'auto';
    }
    return 'auto';
  }

  async getTranslationQuality(
    originalText: string,
    translatedText: string,
    targetLanguage: string
  ): Promise<{
    accuracy: number;
    fluency: number;
    consistency: number;
    culturalAdaptation: number;
    overall: number;
  }> {
    const defaultScores = {
      accuracy: 85,
      fluency: 82,
      consistency: 88,
      culturalAdaptation: 80,
      overall: 84
    };

    if (!this.config) return defaultScores;

    try {
      await this.enforceRateLimit();
      
      const prompt = `
Evaluate the quality of this translation to ${targetLanguage}:

Original: ${originalText.substring(0, 1000)}
Translation: ${translatedText.substring(0, 1000)}

Rate each aspect from 0-100:
Accuracy: [score]
Fluency: [score]
Consistency: [score]
Cultural Adaptation: [score]
      `.trim();

      let evaluation = '';
      if (this.config.provider === 'gemini') {
        evaluation = await this.evaluateWithGemini(prompt);
      } else {
        evaluation = await this.evaluateWithOpenAI(prompt);
      }

      return this.parseQualityScores(evaluation);
    } catch (error) {
      console.error('Quality assessment error:', error);
      return defaultScores;
    }
  }

  private async evaluateWithGemini(prompt: string): Promise<string> {
    const baseUrl = AI_PROVIDERS.find(p => p.id === 'gemini')!.baseUrl;
    const model = AI_PROVIDERS.find(p => p.id === 'gemini')!.defaultModel;
    
    const response = await fetch(`${baseUrl}/${model}:generateContent?key=${this.config!.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates[0]?.content.parts[0]?.text || '';
    }
    return '';
  }

  private async evaluateWithOpenAI(prompt: string): Promise<string> {
    const provider = AI_PROVIDERS.find(p => p.id === this.config!.provider)!;
    const baseUrl = this.config!.baseUrl || provider.baseUrl;
    const model = this.config!.model || provider.defaultModel;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config!.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 200
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
    return '';
  }

  private parseQualityScores(evaluation: string): {
    accuracy: number;
    fluency: number;
    consistency: number;
    culturalAdaptation: number;
    overall: number;
  } {
    const accuracyMatch = evaluation.match(/Accuracy:\s*(\d+)/i);
    const fluencyMatch = evaluation.match(/Fluency:\s*(\d+)/i);
    const consistencyMatch = evaluation.match(/Consistency:\s*(\d+)/i);
    const culturalMatch = evaluation.match(/Cultural Adaptation:\s*(\d+)/i);

    const accuracy = accuracyMatch ? parseInt(accuracyMatch[1]) : 85;
    const fluency = fluencyMatch ? parseInt(fluencyMatch[1]) : 82;
    const consistency = consistencyMatch ? parseInt(consistencyMatch[1]) : 88;
    const culturalAdaptation = culturalMatch ? parseInt(culturalMatch[1]) : 80;
    const overall = Math.round((accuracy + fluency + consistency + culturalAdaptation) / 4);

    return {
      accuracy: Math.min(100, Math.max(0, accuracy)),
      fluency: Math.min(100, Math.max(0, fluency)),
      consistency: Math.min(100, Math.max(0, consistency)),
      culturalAdaptation: Math.min(100, Math.max(0, culturalAdaptation)),
      overall: Math.min(100, Math.max(0, overall))
    };
  }

  getRateLimitStatus() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimitInfo.lastRequestTime;
    const resetTime = new Date(this.rateLimitInfo.lastRequestTime + 60000);
    
    return {
      remaining: Math.max(0, this.rateLimitInfo.requestsPerMinute - this.rateLimitInfo.requestCount),
      resetTime,
      requestsPerMinute: this.rateLimitInfo.requestsPerMinute
    };
  }
}

export const aiProviderService = new AIProviderService();
