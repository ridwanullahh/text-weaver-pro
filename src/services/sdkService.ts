
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
        fullName: 'string',
        verified: 'boolean',
        roles: 'array',
        permissions: 'array',
        walletBalance: 'number',
        dailyTextTranslations: 'number',
        lastResetDate: 'string'
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
    },
    invite_codes: {
      required: ['code'],
      types: {
        code: 'string',
        used: 'boolean',
        createdBy: 'string',
        createdFor: 'string',
        usedBy: 'string',
        createdAt: 'string'
      }
    },
    invite_requests: {
      required: ['email', 'fullName'],
      types: {
        email: 'string',
        fullName: 'string',
        company: 'string',
        useCase: 'string',
        expectedVolume: 'string',
        status: 'string',
        requestedAt: 'string',
        approvedBy: 'string',
        approvedAt: 'string',
        inviteCode: 'string'
      }
    },
    transactions: {
      required: ['userId', 'amount', 'type'],
      types: {
        userId: 'string',
        amount: 'number',
        type: 'string',
        description: 'string',
        createdAt: 'string'
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
