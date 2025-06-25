
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
  }
}

export const translationDB = new TranslationDatabase();

// Database utilities
export const dbUtils = {
  async createProject(project: Omit<TranslationProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<TranslationProject> {
    const now = new Date();
    const newProject = {
      ...project,
      createdAt: now,
      updatedAt: now
    };
    
    const id = await translationDB.projects.add(newProject as TranslationProject);
    return { ...newProject, id } as TranslationProject;
  },

  async updateProject(id: number, updates: Partial<TranslationProject>): Promise<void> {
    await translationDB.projects.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async getProject(id: number): Promise<TranslationProject | undefined> {
    return await translationDB.projects.get(id);
  },

  async deleteProject(id: number): Promise<void> {
    await translationDB.transaction('rw', translationDB.projects, translationDB.chunks, async () => {
      await translationDB.projects.delete(id);
      await translationDB.chunks.where('projectId').equals(id).delete();
    });
  },

  async addChunk(chunk: Omit<TranslationChunk, 'id' | 'createdAt'>): Promise<TranslationChunk> {
    const newChunk = {
      ...chunk,
      createdAt: new Date()
    };
    
    const id = await translationDB.chunks.add(newChunk as TranslationChunk);
    return { ...newChunk, id } as TranslationChunk;
  },

  async updateChunk(id: number, updates: Partial<TranslationChunk>): Promise<void> {
    await translationDB.chunks.update(id, updates);
  },

  async getProjectChunks(projectId: number): Promise<TranslationChunk[]> {
    return await translationDB.chunks.where('projectId').equals(projectId).sortBy('chunkIndex');
  }
};
