
import { TranslationProject, TranslationChunk } from '../types/translation';
import { dbUtils } from '../utils/database';

interface TranslationProgress {
  percentage: number;
  currentLanguage: string;
  estimatedTimeRemaining: number;
  tokensUsed: number;
}

interface TranslationCallbacks {
  onProgress: (progress: TranslationProgress) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

class TranslationService {
  private activeTranslations = new Map<number, boolean>();
  private rateLimitTracker = {
    tokensUsed: 0,
    lastReset: new Date(),
    maxTokensPerMinute: 1000000 // Gemini 2.5 Flash rate limit
  };

  async startTranslation(project: TranslationProject, callbacks: TranslationCallbacks) {
    if (this.activeTranslations.get(project.id!)) {
      throw new Error('Translation already in progress for this project');
    }

    this.activeTranslations.set(project.id!, true);
    
    try {
      // Update project status
      await dbUtils.updateProject(project.id!, { status: 'processing' });
      
      // Split content into chunks
      const chunks = this.splitIntoChunks(project.originalContent, project.settings.chunkSize);
      
      // Create or retrieve existing chunks
      const existingChunks = await dbUtils.getProjectChunks(project.id!);
      const chunksToProcess = existingChunks.length > 0 ? existingChunks : await this.createChunks(project.id!, chunks);
      
      let completedChunks = 0;
      let totalChunks = chunksToProcess.length * project.targetLanguages.length;
      let tokensUsed = 0;
      
      // Process each target language
      for (const targetLanguage of project.targetLanguages) {
        if (!this.activeTranslations.get(project.id!)) break; // Check if paused
        
        for (const chunk of chunksToProcess) {
          if (!this.activeTranslations.get(project.id!)) break; // Check if paused
          
          // Check if this chunk is already translated for this language
          if (chunk.translations[targetLanguage] && chunk.status === 'completed') {
            completedChunks++;
            continue;
          }
          
          // Rate limiting
          await this.checkRateLimit();
          
          try {
            const translatedText = await this.translateChunk(chunk.originalText, targetLanguage, project);
            
            // Update chunk with translation
            chunk.translations[targetLanguage] = translatedText;
            chunk.status = 'completed';
            await dbUtils.updateChunk(chunk.id!, { 
              translations: chunk.translations, 
              status: 'completed' 
            });
            
            completedChunks++;
            tokensUsed += this.estimateTokens(chunk.originalText + translatedText);
            
            // Calculate progress
            const percentage = (completedChunks / totalChunks) * 100;
            const estimatedTimeRemaining = this.calculateETA(completedChunks, totalChunks, new Date());
            
            callbacks.onProgress({
              percentage,
              currentLanguage: targetLanguage,
              estimatedTimeRemaining,
              tokensUsed
            });
            
            // Update project progress
            await dbUtils.updateProject(project.id!, { 
              progress: percentage,
              completedChunks: Math.floor(completedChunks / project.targetLanguages.length)
            });
            
          } catch (error) {
            console.error(`Error translating chunk ${chunk.id} to ${targetLanguage}:`, error);
            chunk.retryCount = (chunk.retryCount || 0) + 1;
            
            if (chunk.retryCount >= project.settings.maxRetries) {
              chunk.status = 'error';
              await dbUtils.updateChunk(chunk.id!, { 
                status: 'error', 
                retryCount: chunk.retryCount 
              });
            }
          }
          
          // Small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Mark project as completed
      await dbUtils.updateProject(project.id!, { 
        status: 'completed', 
        progress: 100 
      });
      
      this.activeTranslations.delete(project.id!);
      callbacks.onComplete();
      
    } catch (error) {
      this.activeTranslations.delete(project.id!);
      await dbUtils.updateProject(project.id!, { status: 'error' });
      callbacks.onError(error as Error);
    }
  }

  async pauseTranslation(projectId: number) {
    this.activeTranslations.set(projectId, false);
    await dbUtils.updateProject(projectId, { status: 'paused' });
  }

  async resetTranslation(projectId: number) {
    this.activeTranslations.delete(projectId);
    
    // Reset all chunks
    const chunks = await dbUtils.getProjectChunks(projectId);
    for (const chunk of chunks) {
      await dbUtils.updateChunk(chunk.id!, {
        translations: {},
        status: 'pending',
        retryCount: 0
      });
    }
    
    // Reset project
    await dbUtils.updateProject(projectId, {
      status: 'pending',
      progress: 0,
      completedChunks: 0
    });
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Split by sentences to maintain context
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '.';
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private async createChunks(projectId: number, textChunks: string[]): Promise<TranslationChunk[]> {
    const chunks: TranslationChunk[] = [];
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = await dbUtils.addChunk({
        projectId,
        chunkIndex: i,
        originalText: textChunks[i],
        translations: {},
        status: 'pending',
        retryCount: 0
      });
      chunks.push(chunk);
    }
    
    return chunks;
  }

  private async translateChunk(text: string, targetLanguage: string, project: TranslationProject): Promise<string> {
    // This would integrate with Gemini 2.5 Flash API
    // For now, we'll simulate the translation process
    
    const prompt = `Translate the following text from ${project.sourceLanguage} to ${targetLanguage}. 
    Style: ${project.settings.translationStyle}
    Context-aware: ${project.settings.contextAware}
    Preserve formatting: ${project.settings.preserveFormatting}
    
    Text to translate:
    ${text}`;

    try {
      // Simulate API call to Gemini 2.5 Flash
      const response = await this.callGeminiAPI(prompt);
      return response;
    } catch (error) {
      throw new Error(`Translation failed: ${error}`);
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    // This would be the actual Gemini API call
    // For simulation, we'll return a modified version of the original text
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate translation by adding language prefix
    return `[TRANSLATED] ${prompt.split('Text to translate:')[1]?.trim() || prompt}`;
  }

  private async checkRateLimit() {
    const now = new Date();
    const timeSinceReset = now.getTime() - this.rateLimitTracker.lastReset.getTime();
    
    // Reset counter every minute
    if (timeSinceReset > 60000) {
      this.rateLimitTracker.tokensUsed = 0;
      this.rateLimitTracker.lastReset = now;
    }
    
    // If approaching rate limit, wait
    if (this.rateLimitTracker.tokensUsed > this.rateLimitTracker.maxTokensPerMinute * 0.9) {
      const waitTime = 60000 - timeSinceReset;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private calculateETA(completed: number, total: number, startTime: Date): number {
    if (completed === 0) return 0;
    
    const elapsed = (new Date().getTime() - startTime.getTime()) / 1000;
    const rate = completed / elapsed;
    const remaining = total - completed;
    
    return Math.round(remaining / rate);
  }
}

export const translationService = new TranslationService();
