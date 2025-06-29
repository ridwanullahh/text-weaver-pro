
import UniversalSDK from './universalSDK';

// Check if we have valid credentials
const hasValidCredentials = () => {
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  
  return owner && repo && token && owner !== 'demo' && token !== 'demo-token';
};

// SDK Configuration with proper environment variables
const sdkConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'ridwanullahh',
  repo: import.meta.env.VITE_GITHUB_REPO || 'bettertranslatordb',
  token: import.meta.env.VITE_GITHUB_TOKEN || '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',
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
    console.log('Initializing SDK with config:', {
      owner: sdkConfig.owner,
      repo: sdkConfig.repo,
      hasToken: !!sdkConfig.token,
      hasValidCredentials: hasValidCredentials()
    });

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

// Enhanced SDK wrapper with better error handling and toasts
const createSDKWrapper = () => {
  return {
    async get<T = any>(collection: string): Promise<T[]> {
      try {
        return await sdk.get<T>(collection);
      } catch (error) {
        console.error(`Failed to get ${collection}:`, error);
        throw new Error(`Failed to load ${collection}`);
      }
    },

    async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
      try {
        return await sdk.insert<T>(collection, item);
      } catch (error) {
        console.error(`Failed to insert into ${collection}:`, error);
        throw error;
      }
    },

    async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
      try {
        return await sdk.update<T>(collection, key, updates);
      } catch (error) {
        console.error(`Failed to update ${collection}:`, error);
        throw error;
      }
    },

    async delete<T = any>(collection: string, key: string): Promise<void> {
      try {
        return await sdk.delete<T>(collection, key);
      } catch (error) {
        console.error(`Failed to delete from ${collection}:`, error);
        throw error;
      }
    },

    // Authentication methods with better error handling
    async login(email: string, password: string): Promise<string> {
      try {
        return await sdk.login(email, password);
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Invalid email or password');
      }
    },

    async register(email: string, password: string, profile: any): Promise<any> {
      try {
        return await sdk.register(email, password, profile);
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
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
