
export interface TranslationProject {
  id?: number;
  name: string;
  sourceLanguage: string;
  targetLanguages: string[];
  originalContent: string;
  fileType: 'text' | 'pdf' | 'docx' | 'epub';
  totalChunks: number;
  completedChunks: number;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'paused';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  settings: TranslationSettings;
}

export interface TranslationChunk {
  id?: number;
  projectId: number;
  chunkIndex: number;
  originalText: string;
  translations: Record<string, string>; // language code -> translated text
  status: 'pending' | 'processing' | 'completed' | 'error';
  retryCount: number;
  createdAt: Date;
}

export interface TranslationSettings {
  preserveFormatting: boolean;
  chunkSize: number;
  maxRetries: number;
  translationStyle: 'formal' | 'casual' | 'literary' | 'technical';
  contextAware: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ExportFormat {
  type: 'pdf' | 'docx' | 'epub' | 'txt' | 'html';
  name: string;
  icon: string;
  description: string;
}

export interface TranslationProgress {
  projectId: number;
  totalChunks: number;
  completedChunks: number;
  errorChunks: number;
  currentLanguage: string;
  estimatedTimeRemaining: number;
  tokensUsed: number;
  rateLimitStatus: {
    remaining: number;
    resetTime: Date;
  };
}
