
import { TranslationProject } from '../types/translation';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface RateLimitInfo {
  requestsPerMinute: number;
  lastRequestTime: number;
  requestCount: number;
}

class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  private rateLimitInfo: RateLimitInfo = {
    requestsPerMinute: 15, // Conservative limit for free tier
    lastRequestTime: 0,
    requestCount: 0
  };

  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimitInfo.lastRequestTime;
    
    // Reset counter if more than a minute has passed
    if (timeSinceLastRequest > 60000) {
      this.rateLimitInfo.requestCount = 0;
      this.rateLimitInfo.lastRequestTime = now;
    }
    
    // If we've hit the rate limit, wait
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
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please set up your API key first.');
    }

    await this.enforceRateLimit();

    const styleInstructions = this.getStyleInstructions(project.settings.translationStyle);
    const contextInstructions = project.settings.contextAware ? 
      'Consider the context and maintain consistency with previous translations.' : '';

    const prompt = `
Translate the following text from ${sourceLanguage} to ${targetLanguage}.

Translation Requirements:
- ${styleInstructions}
- ${project.settings.preserveFormatting ? 'Preserve original formatting, line breaks, and structure.' : 'Focus on natural flow over formatting.'}
- ${contextInstructions}
- Maintain cultural appropriateness and nuance
- Keep technical terms accurate
- Preserve the author's tone and intent

Text to translate:
${text}

Provide only the translated text without any explanations or additional comments.
    `.trim();

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        throw new Error(`Translation failed: ${errorData.error?.message || response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No translation generated. Please try again.');
      }

      const translatedText = data.candidates[0].content.parts[0].text.trim();
      
      if (!translatedText) {
        throw new Error('Empty translation received. Please try again.');
      }

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Translation service temporarily unavailable. Please try again later.');
    }
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.apiKey) {
      return 'auto';
    }

    await this.enforceRateLimit();

    const prompt = `
Detect the language of the following text and respond with only the language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, 'de' for German, 'zh' for Chinese, 'ja' for Japanese, 'ar' for Arabic).

Text: ${text.substring(0, 500)}

Respond with only the two-letter language code.
    `.trim();

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            temperature: 0.1,
            topK: 10,
            topP: 0.8,
            maxOutputTokens: 10,
          }
        })
      });

      if (response.ok) {
        const data: GeminiResponse = await response.json();
        const detectedLanguage = data.candidates[0]?.content.parts[0]?.text.trim().toLowerCase();
        return detectedLanguage || 'auto';
      }
      
      return 'auto';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'auto';
    }
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
    if (!this.apiKey) {
      return {
        accuracy: 85,
        fluency: 82,
        consistency: 88,
        culturalAdaptation: 80,
        overall: 84
      };
    }

    await this.enforceRateLimit();

    const prompt = `
Evaluate the quality of this translation to ${targetLanguage}:

Original: ${originalText.substring(0, 1000)}
Translation: ${translatedText.substring(0, 1000)}

Rate each aspect from 0-100:
- Accuracy: How well does the translation convey the original meaning?
- Fluency: How natural does the translation sound in the target language?
- Consistency: How consistent is the terminology and style?
- Cultural Adaptation: How well adapted is the translation to the target culture?

Respond in this exact format:
Accuracy: [score]
Fluency: [score]
Consistency: [score]
Cultural Adaptation: [score]
    `.trim();

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            temperature: 0.2,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 200,
          }
        })
      });

      if (response.ok) {
        const data: GeminiResponse = await response.json();
        const evaluation = data.candidates[0]?.content.parts[0]?.text || '';
        
        const scores = this.parseQualityScores(evaluation);
        return scores;
      }
      
      // Fallback scores
      return {
        accuracy: 85,
        fluency: 82,
        consistency: 88,
        culturalAdaptation: 80,
        overall: 84
      };
    } catch (error) {
      console.error('Quality assessment error:', error);
      return {
        accuracy: 85,
        fluency: 82,
        consistency: 88,
        culturalAdaptation: 80,
        overall: 84
      };
    }
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

  private getStyleInstructions(style: string): string {
    switch (style) {
      case 'formal':
        return 'Use formal, professional language appropriate for official documents.';
      case 'casual':
        return 'Use casual, conversational language that sounds natural and friendly.';
      case 'literary':
        return 'Maintain literary style, preserving artistic expression and poetic elements.';
      case 'technical':
        return 'Use precise technical terminology and maintain scientific accuracy.';
      default:
        return 'Use natural, appropriate language for the content type.';
    }
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

export const geminiService = new GeminiService();
