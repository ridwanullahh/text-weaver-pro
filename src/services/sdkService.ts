
import UniversalSDK from './universalSDK';

// Check if we have valid credentials
const hasValidCredentials = () => {
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  
  return owner && repo && token && owner !== 'demo';
};

// SDK Configuration with fallback for missing credentials
const sdkConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'demo',
  repo: import.meta.env.VITE_GITHUB_REPO || 'textweaver-data',
  token: import.meta.env.VITE_GITHUB_TOKEN || 'demo-token',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  basePath: 'db',
  cloudinary: {
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  }
};

// Create SDK instance
export const sdk = new UniversalSDK(sdkConfig);

// Initialize SDK with demo data seeding
export const initializeSDK = async (): Promise<boolean> => {
  try {
    if (!hasValidCredentials()) {
      console.warn('GitHub credentials not configured properly, using demo mode');
      // The SDK will automatically seed demo data when initialized
      await sdk.init();
      return true;
    }

    await sdk.init();
    console.log('SDK initialized successfully with GitHub backend');
    return true;
  } catch (error) {
    console.error('SDK initialization failed:', error);
    // Even if GitHub fails, we can still use demo data
    return true;
  }
};

// Enhanced SDK wrapper that works with the UniversalSDK
const createSDKWrapper = () => {
  return {
    async get<T = any>(collection: string): Promise<T[]> {
      return sdk.get<T>(collection);
    },

    async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
      return sdk.insert<T>(collection, item);
    },

    async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
      return sdk.update<T>(collection, key, updates);
    },

    async delete<T = any>(collection: string, key: string): Promise<void> {
      return sdk.delete<T>(collection, key);
    },

    // Authentication methods
    async login(email: string, password: string): Promise<string> {
      return sdk.login(email, password) as Promise<string>;
    },

    async register(email: string, password: string, profile: any): Promise<any> {
      return sdk.register(email, password, profile);
    },

    getCurrentUser(token: string) {
      return sdk.getCurrentUser(token);
    },

    // Hash password utility
    hashPassword: sdk.hashPassword.bind(sdk),
    verifyPassword: sdk.verifyPassword.bind(sdk)
  };
};

export const wrappedSDK = createSDKWrapper();
export { sdk as originalSDK };
