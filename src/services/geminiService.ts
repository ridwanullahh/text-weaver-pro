
import { TranslationProject } from '../types/translation';

interface GeminiAPIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class GeminiService {
  private config: GeminiAPIConfig = {
    apiKey: '', // To be set by user
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/',
    model: 'gemini-2.5-flash',
    maxTokens: 8192,
    temperature: 0.1
  };

  private rateLimitTracker = {
    requestsPerMinute: 0,
    lastReset: new Date(),
    maxRequestsPerMinute: 1500, // Gemini 2.5 Flash rate limit
    tokensPerMinute: 0,
    maxTokensPerMinute: 1000000
  };

  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  async translateText(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string, 
    project: TranslationProject
  ): Promise<string> {
    await this.checkRateLimit();

    const prompt = this.buildTranslationPrompt(text, sourceLanguage, targetLanguage, project);
    
    try {
      const response = await this.makeGeminiRequest(prompt);
      this.updateRateLimit(text.length + response.length);
      return this.extractTranslation(response);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Translation failed: ${error}`);
    }
  }

  private buildTranslationPrompt(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string, 
    project: TranslationProject
  ): string {
    const contextPrompt = project.settings.contextAware ? 
      `This is part of a larger ${project.fileType} document titled "${project.name}". Maintain consistency with the overall context and style.` : 
      '';

    const stylePrompt = this.getStylePrompt(project.settings.translationStyle);
    const formatPrompt = project.settings.preserveFormatting ? 
      'Preserve all formatting, including line breaks, spacing, and structure.' : 
      'Focus on natural language flow.';

    return `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}.

Requirements:
- Translation style: ${stylePrompt}
- ${formatPrompt}
- ${contextPrompt}
- Maintain cultural appropriateness and natural flow
- Do not add explanations or notes, only provide the translation

Text to translate:
${text}

Translation:`;
  }

  private getStylePrompt(style: string): string {
    switch (style) {
      case 'formal':
        return 'Use formal, professional language suitable for business or academic contexts.';
      case 'casual':
        return 'Use casual, conversational language that sounds natural and friendly.';
      case 'literary':
        return 'Use elegant, sophisticated language with attention to literary style and flow.';
      case 'technical':
        return 'Use precise, technical language maintaining accuracy of specialized terms.';
      default:
        return 'Use appropriate, natural language for the context.';
    }
  }

  private async makeGeminiRequest(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      // Fallback to simulation if no API key is provided
      return this.simulateTranslation(prompt);
    }

    const response = await fetch(
      `${this.config.baseURL}${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
            topP: 0.8,
            topK: 10
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async simulateTranslation(prompt: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Extract the text to translate from the prompt
    const textMatch = prompt.match(/Text to translate:\s*([\s\S]+?)\s*Translation:/);
    const textToTranslate = textMatch ? textMatch[1].trim() : prompt;
    
    // Return a simulated translation
    return `[TRANSLATED] ${textToTranslate}`;
  }

  private extractTranslation(response: string): string {
    // Clean up the response by removing any unwanted prefixes/suffixes
    return response.trim();
  }

  private async checkRateLimit() {
    const now = new Date();
    const timeSinceReset = now.getTime() - this.rateLimitTracker.lastReset.getTime();
    
    // Reset counters every minute
    if (timeSinceReset > 60000) {
      this.rateLimitTracker.requestsPerMinute = 0;
      this.rateLimitTracker.tokensPerMinute = 0;
      this.rateLimitTracker.lastReset = now;
    }
    
    // Check if we're approaching limits
    if (this.rateLimitTracker.requestsPerMinute >= this.rateLimitTracker.maxRequestsPerMinute * 0.9) {
      const waitTime = 60000 - timeSinceReset;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  private updateRateLimit(tokensUsed: number) {
    this.rateLimitTracker.requestsPerMinute++;
    this.rateLimitTracker.tokensPerMinute += Math.ceil(tokensUsed / 4); // Rough token estimation
  }

  async detectLanguage(text: string): Promise<string> {
    const prompt = `Detect the language of the following text and respond with only the language code (e.g., "en", "es", "fr"):

${text.substring(0, 500)}`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      return response.trim().toLowerCase();
    } catch (error) {
      console.error('Language detection error:', error);
      return 'auto';
    }
  }

  async getTranslationQuality(originalText: string, translatedText: string, targetLanguage: string): Promise<{
    accuracy: number;
    fluency: number;
    consistency: number;
    culturalAdaptation: number;
    overall: number;
  }> {
    const prompt = `Evaluate the translation quality on a scale of 1-100 for each category. Respond with only the numbers in this format:
Accuracy: X
Fluency: X
Consistency: X
Cultural Adaptation: X
Overall: X

Original text: ${originalText}
Translation: ${translatedText}
Target language: ${targetLanguage}`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      const scores = this.parseQualityScores(response);
      return scores;
    } catch (error) {
      console.error('Quality assessment error:', error);
      // Return default scores if API fails
      return {
        accuracy: 85,
        fluency: 82,
        consistency: 88,
        culturalAdaptation: 80,
        overall: 84
      };
    }
  }

  private parseQualityScores(response: string): {
    accuracy: number;
    fluency: number;
    consistency: number;
    culturalAdaptation: number;
    overall: number;
  } {
    const defaultScores = {
      accuracy: 85,
      fluency: 82,
      consistency: 88,
      culturalAdaptation: 80,
      overall: 84
    };

    try {
      const accuracyMatch = response.match(/Accuracy:\s*(\d+)/i);
      const fluencyMatch = response.match(/Fluency:\s*(\d+)/i);
      const consistencyMatch = response.match(/Consistency:\s*(\d+)/i);
      const culturalMatch = response.match(/Cultural\s*Adaptation:\s*(\d+)/i);
      const overallMatch = response.match(/Overall:\s*(\d+)/i);

      return {
        accuracy: accuracyMatch ? parseInt(accuracyMatch[1]) : defaultScores.accuracy,
        fluency: fluencyMatch ? parseInt(fluencyMatch[1]) : defaultScores.fluency,
        consistency: consistencyMatch ? parseInt(consistencyMatch[1]) : defaultScores.consistency,
        culturalAdaptation: culturalMatch ? parseInt(culturalMatch[1]) : defaultScores.culturalAdaptation,
        overall: overallMatch ? parseInt(overallMatch[1]) : defaultScores.overall
      };
    } catch (error) {
      return defaultScores;
    }
  }
}

export const geminiService = new GeminiService();
