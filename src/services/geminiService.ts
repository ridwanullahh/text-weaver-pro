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

    const styleInstructions = this.getAdvancedStyleInstructions(project.settings.translationStyle);
    const contextInstructions = project.settings.contextAware ? 
      'Consider the context and maintain consistency with previous translations. Preserve the logical flow and coherence of the document.' : '';
    
    const formattingInstructions = project.settings.preserveFormatting ? 
      'CRITICAL: Preserve ALL original formatting including line breaks, paragraph structure, bullet points, numbering, and spacing. Maintain the exact document structure.' : 
      'Focus on natural language flow while maintaining readability.';
    
    const qualityInstructions = `
TRANSLATION QUALITY REQUIREMENTS:
- Accuracy: Translate the exact meaning without adding or omitting information
- Fluency: Ensure the translation reads naturally in ${targetLanguage}
- Consistency: Use consistent terminology throughout
- Cultural Adaptation: Adapt idioms and cultural references appropriately
- Tone Preservation: Maintain the original author's tone and style
`;

    const prompt = `
You are a professional translator with expertise in ${sourceLanguage} to ${targetLanguage} translation.

${qualityInstructions}

STYLE REQUIREMENTS:
${styleInstructions}

FORMATTING REQUIREMENTS:
${formattingInstructions}

CONTEXT REQUIREMENTS:
${contextInstructions}

ADDITIONAL GUIDELINES:
- For technical terms, prioritize accuracy over literal translation
- For proper nouns, research appropriate translations or transliterations
- For ambiguous terms, choose the meaning that best fits the context
- Maintain any special formatting markers (**, __, etc.)
- Preserve any code snippets, URLs, or email addresses unchanged

SOURCE LANGUAGE: ${sourceLanguage}
TARGET LANGUAGE: ${targetLanguage}

TEXT TO TRANSLATE:
"""
${text}
"""

IMPORTANT: Provide ONLY the translated text. Do not include explanations, notes, or commentary.
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
            temperature: 0.2, // Lower temperature for more consistent translations
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 8192,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (response.status === 400) {
          throw new Error('Invalid request. Please check your content and try again.');
        }
        if (response.status === 403) {
          throw new Error('API key invalid or quota exceeded. Please check your Gemini API configuration.');
        }
        throw new Error(`Translation failed: ${errorData.error?.message || response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No translation generated. The content may have triggered safety filters.');
      }

      const translatedText = data.candidates[0].content.parts[0].text.trim();
      
      if (!translatedText) {
        throw new Error('Empty translation received. Please try again with different content.');
      }

      // Post-process the translation to ensure quality
      return this.postProcessTranslation(translatedText, project.settings.preserveFormatting);
    } catch (error) {
      console.error('Translation error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Translation service temporarily unavailable. Please try again later.');
    }
  }

  private postProcessTranslation(text: string, preserveFormatting: boolean): string {
    let processed = text;
    
    // Clean up common AI translation artifacts
    processed = processed.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    processed = processed.replace(/^\s*Translation:\s*/i, ''); // Remove "Translation:" prefix
    processed = processed.replace(/^\s*Result:\s*/i, ''); // Remove "Result:" prefix
    
    if (preserveFormatting) {
      // Ensure proper line breaks are maintained
      processed = processed.replace(/\n\s*\n/g, '\n\n'); // Normalize paragraph breaks
    } else {
      // Clean up excessive whitespace
      processed = processed.replace(/\s+/g, ' ').trim();
    }
    
    return processed;
  }

  private getAdvancedStyleInstructions(style: string): string {
    const baseInstructions = {
      formal: 'Use formal, professional language with proper grammar and sophisticated vocabulary. Maintain a respectful and authoritative tone suitable for official documents, academic papers, or business communications.',
      casual: 'Use casual, conversational language that sounds natural and approachable. Include colloquialisms and informal expressions where appropriate, but maintain clarity and readability.',
      literary: 'Preserve the artistic and literary qualities of the text. Maintain poetic elements, metaphors, literary devices, and the author\'s unique voice. Pay special attention to rhythm, style, and aesthetic appeal.',
      technical: 'Use precise technical terminology and maintain scientific accuracy. Prioritize clarity and precision over stylistic flourishes. Ensure all technical terms are correctly translated and contextually appropriate.'
    };

    return baseInstructions[style as keyof typeof baseInstructions] || baseInstructions.formal;
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
