
import UniversalSDK, { UniversalSDKConfig } from './universalSDK';

// Check if we have valid credentials
const hasValidCredentials = () => {
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  
  return owner && repo && token;
};

// SDK Configuration with fallback for missing credentials
const sdkConfig: UniversalSDKConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'demo',
  repo: import.meta.env.VITE_GITHUB_REPO || 'textweaver-data',
  token: import.meta.env.VITE_GITHUB_TOKEN || 'demo-token',
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
    requireEmailVerification: false, // Disable for now
    otpTriggers: []
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
    },
    blog_posts: {
      required: ['title', 'content'],
      types: {
        title: 'string',
        content: 'string',
        excerpt: 'string',
        author: 'string',
        publishedAt: 'string',
        tags: 'array',
        featured: 'boolean',
        slug: 'string'
      }
    },
    contact_messages: {
      required: ['name', 'email', 'message'],
      types: {
        name: 'string',
        email: 'string',
        subject: 'string',
        message: 'string',
        submittedAt: 'string',
        status: 'string'
      }
    }
  }
};

// Create SDK instance
export const sdk = new UniversalSDK(sdkConfig);

// Mock data for demo purposes when credentials are missing
const mockData = {
  users: [
    {
      id: '1',
      uid: 'admin-user-1',
      email: 'admin@textweaverpro.com',
      password: sdk.hashPassword('admin123'),
      fullName: 'Admin User',
      verified: true,
      roles: ['admin', 'user'],
      permissions: ['manage_users', 'manage_content'],
      walletBalance: 100,
      dailyTextTranslations: 0,
      lastResetDate: new Date().toDateString()
    }
  ],
  invite_codes: [
    {
      id: '1',
      uid: 'invite-1',
      code: 'WELCOME2024',
      used: false,
      createdBy: 'system',
      createdFor: 'public',
      usedBy: '',
      createdAt: new Date().toISOString()
    }
  ],
  blog_posts: [
    {
      id: '1',
      uid: 'blog-1',
      title: 'Welcome to TextWeaver Pro',
      excerpt: 'Discover how AI-powered document translation can transform your workflow.',
      content: 'Welcome to TextWeaver Pro, the next generation of document translation...',
      author: 'TextWeaver Team',
      publishedAt: new Date().toISOString(),
      tags: ['announcement', 'features'],
      featured: true,
      slug: 'welcome-to-textweaver-pro'
    }
  ]
};

// Initialize SDK with mock data fallback
export const initializeSDK = async () => {
  try {
    if (!hasValidCredentials()) {
      console.warn('GitHub credentials not configured, using mock data for demo');
      
      // Simulate SDK initialization with mock data
      Object.entries(mockData).forEach(([collection, data]) => {
        localStorage.setItem(`mock_${collection}`, JSON.stringify(data));
      });
      
      return true;
    }

    await sdk.init();
    console.log('SDK initialized successfully with GitHub backend');
    return true;
  } catch (error) {
    console.error('SDK initialization failed, falling back to mock data:', error);
    
    // Fallback to mock data
    Object.entries(mockData).forEach(([collection, data]) => {
      localStorage.setItem(`mock_${collection}`, JSON.stringify(data));
    });
    
    return true;
  }
};

// Enhanced SDK wrapper with mock data fallback
const createSDKWrapper = () => {
  const isMockMode = !hasValidCredentials();
  
  return {
    async get<T = any>(collection: string): Promise<T[]> {
      if (isMockMode) {
        const mockData = localStorage.getItem(`mock_${collection}`);
        return mockData ? JSON.parse(mockData) : [];
      }
      return sdk.get<T>(collection);
    },

    async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
      if (isMockMode) {
        const data = JSON.parse(localStorage.getItem(`mock_${collection}`) || '[]');
        const id = (Math.max(0, ...data.map((x: any) => +x.id || 0)) + 1).toString();
        const newItem = { uid: crypto.randomUUID(), id, ...item } as T & { id: string; uid: string };
        data.push(newItem);
        localStorage.setItem(`mock_${collection}`, JSON.stringify(data));
        return newItem;
      }
      return sdk.insert<T>(collection, item);
    },

    async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
      if (isMockMode) {
        const data = JSON.parse(localStorage.getItem(`mock_${collection}`) || '[]');
        const index = data.findIndex((x: any) => x.id === key || x.uid === key);
        if (index >= 0) {
          data[index] = { ...data[index], ...updates };
          localStorage.setItem(`mock_${collection}`, JSON.stringify(data));
          return data[index];
        }
        throw new Error('Item not found');
      }
      return sdk.update<T>(collection, key, updates);
    },

    async delete<T = any>(collection: string, key: string): Promise<void> {
      if (isMockMode) {
        const data = JSON.parse(localStorage.getItem(`mock_${collection}`) || '[]');
        const filtered = data.filter((x: any) => x.id !== key && x.uid !== key);
        localStorage.setItem(`mock_${collection}`, JSON.stringify(filtered));
        return;
      }
      return sdk.delete<T>(collection, key);
    },

    // Authentication methods
    async login(email: string, password: string): Promise<string> {
      if (isMockMode) {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const user = users.find((u: any) => u.email === email);
        if (!user || !sdk.verifyPassword(password, user.password)) {
          throw new Error('Invalid credentials');
        }
        const token = crypto.randomUUID();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(user));
        return token;
      }
      return sdk.login(email, password) as Promise<string>;
    },

    async register(email: string, password: string, profile: any): Promise<any> {
      if (isMockMode) {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          throw new Error('Email already registered');
        }

        // Validate invite code
        const inviteCodes = JSON.parse(localStorage.getItem('mock_invite_codes') || '[]');
        const validCode = inviteCodes.find((code: any) => 
          code.code === profile.inviteCode && !code.used
        );
        
        if (!validCode) {
          throw new Error('Invalid invitation code');
        }

        const newUser = {
          id: (users.length + 1).toString(),
          uid: crypto.randomUUID(),
          email,
          password: sdk.hashPassword(password),
          ...profile,
          walletBalance: 0,
          roles: ['user'],
          dailyTextTranslations: 0,
          lastResetDate: new Date().toDateString()
        };

        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));

        // Mark invite code as used
        validCode.used = true;
        validCode.usedBy = email;
        localStorage.setItem('mock_invite_codes', JSON.stringify(inviteCodes));

        return newUser;
      }
      return sdk.register(email, password, profile);
    },

    getCurrentUser(token: string) {
      if (isMockMode) {
        return JSON.parse(localStorage.getItem('current_user') || 'null');
      }
      return sdk.getCurrentUser(token);
    },

    // Hash password utility
    hashPassword: sdk.hashPassword.bind(sdk),
    verifyPassword: sdk.verifyPassword.bind(sdk)
  };
};

export const wrappedSDK = createSDKWrapper();
export { sdk as originalSDK };
