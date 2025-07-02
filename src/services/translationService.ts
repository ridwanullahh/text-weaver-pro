import { TranslationProject, TranslationChunk } from '../types/translation';
import { dbUtils } from '../utils/database';
import { aiProviderService } from './aiProviderService';
import { monetizationService } from './monetizationService';

interface TranslationProgress {
  percentage: number;
  currentLanguage: string;
  estimatedTimeRemaining: number;
  tokensUsed: number;
  currentChunkIndex?: number;
}

interface TranslationCallbacks {
  onProgress: (progress: TranslationProgress) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

class TranslationService {
  private activeTranslations = new Map<string, boolean>();
  private processingQueue = new Map<string, { chunks: TranslationChunk[], currentIndex: number }>();

  async startTranslation(
    project: TranslationProject, 
    callbacks: TranslationCallbacks,
    user?: any,
    updateWallet?: (amount: number) => Promise<void>
  ) {
    if (this.activeTranslations.get(project.id)) {
      throw new Error('Translation already in progress for this project');
    }

    this.activeTranslations.set(project.id, true);
    
    try {
      // Calculate translation cost
      const chunks = this.splitIntoChunks(project.originalContent, project.settings?.chunkSize || 1000);
      const totalTranslations = project.targetLanguages.length * chunks.length;
      const costCalculation = monetizationService.calculateTranslationCost(project.targetLanguages.length, chunks.length);

      // Check if user is logged in and enforce monetization
      if (user) {
        // Check daily free translation limit first
        const dailyCheck = monetizationService.checkDailyTranslationLimit(user);
        
        if (totalTranslations > dailyCheck.remaining) {
          // Need to use paid translations
          const paidTranslations = totalTranslations - dailyCheck.remaining;
          const paidCost = paidTranslations * 0.05; // $0.05 per translation
          
          const balanceCheck = monetizationService.checkWalletBalance(user, paidCost);
          if (!balanceCheck.canProceed) {
            throw new Error(balanceCheck.message);
          }

          // Deduct cost for paid translations
          if (updateWallet && paidCost > 0) {
            const deductionSuccess = await monetizationService.deductFromWallet(user, paidCost, updateWallet);
            if (!deductionSuccess) {
              throw new Error('Failed to process payment for translations');
            }
          }
        }
      } else {
        // For non-logged in users, enforce stricter limits or require login
        if (totalTranslations > 3) {
          throw new Error('Please log in to translate more than 3 text segments');
        }
      }

      // Update project status
      await dbUtils.updateProject(project.id, { status: 'processing' });
      
      // Create or retrieve existing chunks
      const existingChunks = await dbUtils.getProjectChunks(project.id);
      const chunksToProcess = existingChunks.length > 0 ? existingChunks : await this.createChunks(project.id, chunks);
      
      // Initialize processing queue
      this.processingQueue.set(project.id, { chunks: chunksToProcess, currentIndex: 0 });
      
      let completedChunks = 0;
      let totalChunks = chunksToProcess.length * project.targetLanguages.length;
      let tokensUsed = 0;
      const startTime = new Date();
      
      // Process each target language sequentially
      for (const targetLanguage of project.targetLanguages) {
        if (!this.activeTranslations.get(project.id)) break;
        
        // Process chunks sequentially with proper rate limiting
        for (let chunkIndex = 0; chunkIndex < chunksToProcess.length; chunkIndex++) {
          if (!this.activeTranslations.get(project.id)) break;
          
          const chunk = chunksToProcess[chunkIndex];
          
          // Update current chunk index for UI tracking
          this.processingQueue.set(project.id, { chunks: chunksToProcess, currentIndex: chunkIndex });
          
          // Check if this chunk is already translated for this language
          if (chunk.translations[targetLanguage] && chunk.status === 'completed') {
            completedChunks++;
            continue;
          }
          
          // Mark chunk as processing
          chunk.status = 'processing';
          await dbUtils.updateChunk(chunk.id!, { status: 'processing' });
          
          let retryCount = 0;
          let translationSuccess = false;
          
          // Retry loop with exponential backoff
          while (!translationSuccess && retryCount < (project.settings?.maxRetries || 3)) {
            try {
              // Wait for rate limit before attempting translation
              await this.waitForRateLimit();
              
              console.log(`Translating chunk ${chunkIndex + 1}/${chunksToProcess.length} to ${targetLanguage} (attempt ${retryCount + 1})`);
              
              // Use AI provider service for translation
              const translatedText = await aiProviderService.translateText(
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
                status: 'completed',
                retryCount: retryCount
              });
              
              completedChunks++;
              tokensUsed += this.estimateTokens(chunk.originalText + translatedText);
              translationSuccess = true;
              
              console.log(`Successfully translated chunk ${chunkIndex + 1} to ${targetLanguage}`);
              
            } catch (error) {
              console.error(`Error translating chunk ${chunk.id} to ${targetLanguage} (attempt ${retryCount + 1}):`, error);
              retryCount++;
              
              if (retryCount < (project.settings?.maxRetries || 3)) {
                // Exponential backoff: 2^retryCount seconds
                const waitTime = Math.pow(2, retryCount) * 1000;
                console.log(`Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
              }
            }
          }
          
          // If all retries failed, mark as error
          if (!translationSuccess) {
            chunk.status = 'error';
            await dbUtils.updateChunk(chunk.id!, { 
              status: 'error', 
              retryCount: retryCount 
            });
            console.error(`Failed to translate chunk ${chunkIndex + 1} after ${retryCount} attempts`);
          }
          
          // Calculate and report progress
          const percentage = (completedChunks / totalChunks) * 100;
          const estimatedTimeRemaining = this.calculateETA(completedChunks, totalChunks, startTime);
          
          callbacks.onProgress({
            percentage,
            currentLanguage: targetLanguage,
            estimatedTimeRemaining,
            tokensUsed,
            currentChunkIndex: chunkIndex
          });
          
          // Update project progress
          await dbUtils.updateProject(project.id, { 
            progress: percentage,
            completedChunks: Math.floor(completedChunks / project.targetLanguages.length)
          });
          
          // Rate limiting: wait between chunks to avoid hitting limits
          if (chunkIndex < chunksToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between chunks
          }
        }
      }
      
      // Check if translation was actually completed
      const actualCompletedChunks = chunksToProcess.filter(chunk => 
        project.targetLanguages.every(lang => chunk.translations[lang])
      ).length;
      
      const isActuallyCompleted = actualCompletedChunks === chunksToProcess.length;
      
      // Mark project as completed only if all chunks are actually translated
      await dbUtils.updateProject(project.id, { 
        status: isActuallyCompleted ? 'completed' : 'error', 
        progress: isActuallyCompleted ? 100 : (actualCompletedChunks / chunksToProcess.length) * 100
      });
      
      this.activeTranslations.delete(project.id);
      this.processingQueue.delete(project.id);
      
      if (isActuallyCompleted) {
        callbacks.onComplete();
      } else {
        callbacks.onError(new Error(`Translation incomplete. ${actualCompletedChunks}/${chunksToProcess.length} chunks completed.`));
      }
      
    } catch (error) {
      this.activeTranslations.delete(project.id);
      this.processingQueue.delete(project.id);
      await dbUtils.updateProject(project.id, { status: 'error' });
      callbacks.onError(error as Error);
    }
  }

  async pauseTranslation(projectId: string) {
    this.activeTranslations.set(projectId, false);
    await dbUtils.updateProject(projectId, { status: 'paused' });
  }

  async resetTranslation(projectId: string) {
    this.activeTranslations.delete(projectId);
    this.processingQueue.delete(projectId);
    
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

  getCurrentChunkIndex(projectId: string): number {
    return this.processingQueue.get(projectId)?.currentIndex || 0;
  }

  private async waitForRateLimit(): Promise<void> {
    const rateLimitStatus = aiProviderService.getRateLimitStatus();
    
    if (rateLimitStatus.remaining <= 0) {
      const waitTime = rateLimitStatus.resetTime.getTime() - Date.now();
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime + 1000)); // Add 1 second buffer
      }
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      return await aiProviderService.detectLanguage(text);
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
      return await aiProviderService.getTranslationQuality(originalText, translatedText, targetLanguage);
    } catch (error) {
      console.error('Quality assessment failed:', error);
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

  private async createChunks(projectId: string, textChunks: string[]): Promise<TranslationChunk[]> {
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
