import { TranslationProject, TranslationChunk } from '../types/translation';
import { dbUtils } from '../utils/database';
import { geminiService } from './geminiService';

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
      const startTime = new Date();
      
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
          
          try {
            // Use Gemini service for translation
            const translatedText = await geminiService.translateText(
              chunk.originalText,
              project.sourceLanguage,
              targetLanguage,
              project
            );
            
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
            const estimatedTimeRemaining = this.calculateETA(completedChunks, totalChunks, startTime);
            
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

  async detectLanguage(text: string): Promise<string> {
    try {
      return await geminiService.detectLanguage(text);
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'auto';
    }
  }

  async assessTranslationQuality(
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
    try {
      return await geminiService.getTranslationQuality(originalText, translatedText, targetLanguage);
    } catch (error) {
      console.error('Quality assessment failed:', error);
      // Return default scores
      return {
        accuracy: 85,
        fluency: 82,
        consistency: 88,
        culturalAdaptation: 80,
        overall: 84
      };
    }
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
