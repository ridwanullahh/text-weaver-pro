
import UniversalSDK from './universalSDK';

// Check if we have valid credentials
const hasValidCredentials = () => {
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  
  console.log('Checking credentials:', { owner, repo, hasToken: !!token });
  return owner && repo && token && owner !== 'demo' && token !== 'demo-token';
};

// SDK Configuration with proper environment variables
const sdkConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER,
  repo: import.meta.env.VITE_GITHUB_REPO,
  token: import.meta.env.VITE_GITHUB_TOKEN,
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  basePath: 'db',
  cloudinary: {
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  }
};

console.log('SDK Config:', {
  owner: sdkConfig.owner,
  repo: sdkConfig.repo,
  hasToken: !!sdkConfig.token,
  branch: sdkConfig.branch
});

// Validate required configuration
if (!sdkConfig.owner || !sdkConfig.repo || !sdkConfig.token) {
  console.error('Missing required GitHub configuration. Please check your .env file.');
  throw new Error('GitHub configuration incomplete');
}

// Create SDK instance
export const sdk = new UniversalSDK(sdkConfig);

// Initialize SDK with proper error handling
export const initializeSDK = async (): Promise<boolean> => {
  try {
    console.log('Initializing SDK with config:', {
      owner: sdkConfig.owner,
      repo: sdkConfig.repo,
      hasToken: !!sdkConfig.token,
      hasValidCredentials: hasValidCredentials()
    });

    await sdk.init();
    console.log('SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('SDK initialization failed:', error);
    throw error;
  }
};

// Enhanced SDK wrapper with better error handling
const createSDKWrapper = () => {
  return {
    async get<T = any>(collection: string): Promise<T[]> {
      try {
        console.log(`Getting collection: ${collection}`);
        const result = await sdk.get<T>(collection);
        console.log(`Retrieved ${result.length} items from ${collection}`);
        return result;
      } catch (error) {
        console.error(`Failed to get ${collection}:`, error);
        throw new Error(`Failed to load ${collection}`);
      }
    },

    async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
      try {
        console.log(`Inserting into ${collection}:`, item);
        const result = await sdk.insert<T>(collection, item);
        console.log(`Inserted into ${collection}:`, result);
        return result;
      } catch (error) {
        console.error(`Failed to insert into ${collection}:`, error);
        throw error;
      }
    },

    async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
      try {
        console.log(`Updating ${collection} key ${key}:`, updates);
        const result = await sdk.update<T>(collection, key, updates);
        console.log(`Updated ${collection}:`, result);
        return result;
      } catch (error) {
        console.error(`Failed to update ${collection}:`, error);
        throw error;
      }
    },

    async delete<T = any>(collection: string, key: string): Promise<void> {
      try {
        console.log(`Deleting from ${collection} key ${key}`);
        await sdk.delete<T>(collection, key);
        console.log(`Deleted from ${collection}`);
      } catch (error) {
        console.error(`Failed to delete from ${collection}:`, error);
        throw error;
      }
    },

    // Authentication methods
    async login(email: string, password: string): Promise<string> {
      try {
        console.log(`Attempting login for: ${email}`);
        const token = await sdk.login(email, password);
        console.log('Login successful');
        return token;
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Invalid email or password');
      }
    },

    async register(email: string, password: string, profile: any): Promise<any> {
      try {
        console.log(`Attempting registration for: ${email}`);
        const result = await sdk.register(email, password, profile);
        console.log('Registration successful');
        return result;
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
