
import UniversalSDK, { UniversalSDKConfig } from './universalSDK';

// SDK Configuration
const sdkConfig: UniversalSDKConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || '',
  repo: import.meta.env.VITE_GITHUB_REPO || '',
  token: import.meta.env.VITE_GITHUB_TOKEN || '',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  basePath: 'db',
  mediaPath: 'media',
  cloudinary: {
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  },
  smtp: {
    endpoint: import.meta.env.VITE_SMTP_ENDPOINT,
    from: import.meta.env.VITE_SMTP_FROM,
  },
  auth: {
    requireEmailVerification: true,
    otpTriggers: ['register', 'login']
  },
  schemas: {
    users: {
      required: ['email'],
      types: {
        email: 'string',
        password: 'string',
        verified: 'boolean',
        roles: 'array',
        permissions: 'array'
      }
    },
    projects: {
      required: ['name', 'sourceLanguage'],
      types: {
        name: 'string',
        sourceLanguage: 'string',
        targetLanguages: 'array',
        originalContent: 'string',
        status: 'string'
      }
    }
  }
};

export const sdk = new UniversalSDK(sdkConfig);

// Initialize SDK
export const initializeSDK = async () => {
  try {
    await sdk.init();
    console.log('SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('SDK initialization failed:', error);
    return false;
  }
};
