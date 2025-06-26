
import Dexie, { Table } from 'dexie';
import { TranslationProject, TranslationChunk, ExportFormat } from '../types/translation';

class TranslationDatabase extends Dexie {
  projects!: Table<TranslationProject>;
  chunks!: Table<TranslationChunk>;

  constructor() {
    super('TextWeaverProDB');
    
    this.version(1).stores({
      projects: '++id, name, sourceLanguage, targetLanguages, status, createdAt, updatedAt',
      chunks: '++id, projectId, chunkIndex, originalText, translations, status, createdAt'
    });

    // Handle database initialization errors with proper event handler
    this.on('error', (error) => {
      console.error('Database error:', error);
    });
  }
}

export const translationDB = new TranslationDatabase();

// Initialize database connection with better error handling
translationDB.open().catch(error => {
  console.error('Failed to open database:', error);
  // Fallback: try to delete and recreate database
  translationDB.delete().then(() => {
    console.log('Database deleted, attempting to recreate...');
    return translationDB.open();
  }).catch(recreateError => {
    console.error('Failed to recreate database:', recreateError);
  });
});

// Database utilities
export const dbUtils = {
  async createProject(project: Omit<TranslationProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<TranslationProject> {
    try {
      const now = new Date();
      const newProject = {
        ...project,
        createdAt: now,
        updatedAt: now
      };
      
      const id = await translationDB.projects.add(newProject as TranslationProject);
      return { ...newProject, id } as TranslationProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project. Please try again.');
    }
  },

  async updateProject(id: number, updates: Partial<TranslationProject>): Promise<void> {
    try {
      await translationDB.projects.update(id, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project.');
    }
  },

  async getProject(id: number): Promise<TranslationProject | undefined> {
    try {
      return await translationDB.projects.get(id);
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  },

  async deleteProject(id: number): Promise<void> {
    try {
      await translationDB.transaction('rw', translationDB.projects, translationDB.chunks, async () => {
        await translationDB.projects.delete(id);
        await translationDB.chunks.where('projectId').equals(id).delete();
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project.');
    }
  },

  async addChunk(chunk: Omit<TranslationChunk, 'id' | 'createdAt'>): Promise<TranslationChunk> {
    try {
      const newChunk = {
        ...chunk,
        createdAt: new Date()
      };
      
      const id = await translationDB.chunks.add(newChunk as TranslationChunk);
      return { ...newChunk, id } as TranslationChunk;
    } catch (error) {
      console.error('Error adding chunk:', error);
      throw new Error('Failed to add translation chunk.');
    }
  },

  async updateChunk(id: number, updates: Partial<TranslationChunk>): Promise<void> {
    try {
      await translationDB.chunks.update(id, updates);
    } catch (error) {
      console.error('Error updating chunk:', error);
      throw new Error('Failed to update translation chunk.');
    }
  },

  async getProjectChunks(projectId: number): Promise<TranslationChunk[]> {
    try {
      return await translationDB.chunks.where('projectId').equals(projectId).sortBy('chunkIndex');
    } catch (error) {
      console.error('Error getting project chunks:', error);
      return [];
    }
  }
};
