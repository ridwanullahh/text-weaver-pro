
// Universal SDK for GitHub-based backend with proper schema validation
interface UniversalSDKConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
  basePath?: string;
  cloudinary?: {
    uploadPreset?: string;
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
  };
}

interface User {
  id: string;
  uid: string;
  email: string;
  password?: string;
  fullName: string;
  verified: boolean;
  roles: string[];
  permissions: string[];
  walletBalance: number;
  dailyTextTranslations: number;
  lastResetDate: string;
  isActive: boolean;
}

interface DatabaseSchema {
  users: User[];
  invite_codes: any[];
  blog_posts: any[];
  documentation: any[];
  transactions: any[];
  invite_requests: any[];
}

class UniversalSDK {
  private owner: string;
  private repo: string;
  private token: string;
  private branch: string;
  private basePath: string;
  private cloudinary: any;
  private sessionStore: Record<string, any> = {};

  constructor(config: UniversalSDKConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.token = config.token;
    this.branch = config.branch || 'main';
    this.basePath = config.basePath || 'db';
    this.cloudinary = config.cloudinary || {};
    
    console.log('UniversalSDK initialized with:', {
      owner: this.owner,
      repo: this.repo,
      branch: this.branch,
      basePath: this.basePath
    });
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `token ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  private async request(path: string, method: string = 'GET', body: any = null): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    console.log(`GitHub API ${method} request to:`, url);
    
    const requestOptions: RequestInit = {
      method,
      headers: this.headers(),
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    if (method === 'GET') {
      const urlWithRef = `${url}?ref=${this.branch}`;
      const response = await fetch(urlWithRef, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error (${response.status}):`, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } else {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error (${response.status}):`, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    }
  }

  async get<T = any>(collection: string): Promise<T[]> {
    try {
      console.log(`Getting collection: ${collection}`);
      const filePath = `${this.basePath}/${collection}.json`;
      const response = await this.request(filePath);
      
      if (response.content) {
        const content = atob(response.content);
        const data = JSON.parse(content);
        console.log(`Retrieved ${data.length} items from ${collection}`);
        return data;
      }
      
      console.log(`Collection ${collection} is empty or doesn't exist`);
      return [];
    } catch (error) {
      console.log(`Collection ${collection} doesn't exist, returning empty array`);
      return [];
    }
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    const arr = await this.get<T>(collection);
    return arr.find((x: any) => x.id === key || x.uid === key) || null;
  }

  private async save<T = any>(collection: string, data: T[]): Promise<void> {
    const filePath = `${this.basePath}/${collection}.json`;
    let sha: string | undefined;
    
    try {
      const existing = await this.request(filePath);
      sha = existing.sha;
      console.log(`Found existing ${collection}.json with SHA: ${sha}`);
    } catch (error) {
      console.log(`Creating new ${collection}.json file`);
    }

    const content = JSON.stringify(data, null, 2);
    const encodedContent = btoa(content);
    
    const body = {
      message: `Update ${collection} data`,
      content: encodedContent,
      branch: this.branch,
      ...(sha ? { sha } : {})
    };

    console.log(`Saving ${data.length} items to ${collection}`);
    await this.request(filePath, 'PUT', body);
    console.log(`Successfully saved ${collection}`);
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection);
    const maxId = Math.max(0, ...arr.map((x: any) => parseInt(x.id) || 0));
    const id = (maxId + 1).toString();
    const uid = crypto.randomUUID();
    
    const newItem = { 
      id, 
      uid, 
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T & { id: string; uid: string };
    
    arr.push(newItem);
    await this.save(collection, arr);
    
    console.log(`Inserted new item into ${collection}:`, newItem);
    return newItem;
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    const arr = await this.get<T>(collection);
    const index = arr.findIndex((x: any) => x.id === key || x.uid === key);
    
    if (index < 0) {
      throw new Error(`Item with key ${key} not found in ${collection}`);
    }
    
    const updatedItem = { 
      ...arr[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    arr[index] = updatedItem;
    await this.save(collection, arr);
    
    console.log(`Updated item in ${collection}:`, updatedItem);
    return updatedItem;
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    const arr = await this.get<T>(collection);
    const filtered = arr.filter((x: any) => x.id !== key && x.uid !== key);
    
    if (filtered.length === arr.length) {
      throw new Error(`Item with key ${key} not found in ${collection}`);
    }
    
    await this.save(collection, filtered);
    console.log(`Deleted item from ${collection} with key: ${key}`);
  }

  hashPassword(password: string): string {
    const salt = crypto.randomUUID();
    const hash = btoa([...password + salt].map(c => c.charCodeAt(0).toString(16)).join(''));
    return `${salt}$${hash}`;
  }

  verifyPassword(password: string, hashString: string): boolean {
    const [salt, hash] = hashString.split('$');
    const testHash = btoa([...password + salt].map(c => c.charCodeAt(0).toString(16)).join(''));
    return testHash === hash;
  }

  async login(email: string, password: string): Promise<string> {
    console.log(`Attempting login for: ${email}`);
    const users = await this.get<User>('users');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.password) {
      throw new Error('Password not set for user');
    }
    
    if (!this.verifyPassword(password, user.password)) {
      throw new Error('Invalid password');
    }
    
    const token = this.createSession(user);
    console.log(`Login successful for ${email}`);
    return token;
  }

  async register(email: string, password: string, profile: any): Promise<User> {
    console.log(`Attempting registration for: ${email}`);
    const users = await this.get<User>('users');
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }
    
    // Validate invite code
    const inviteCodes = await this.get('invite_codes');
    const validCode = inviteCodes.find((code: any) => 
      code.code === profile.inviteCode && !code.used
    );
    
    if (!validCode) {
      throw new Error('Invalid invitation code');
    }

    const hashedPassword = this.hashPassword(password);
    const user = await this.insert<User>('users', { 
      email, 
      password: hashedPassword, 
      fullName: profile.fullName,
      verified: true,
      roles: ['user'],
      permissions: [],
      walletBalance: 0,
      dailyTextTranslations: 0,
      lastResetDate: new Date().toDateString(),
      isActive: true
    });

    // Mark invite code as used
    await this.update('invite_codes', validCode.id, {
      used: true,
      usedBy: email,
      usedAt: new Date().toISOString()
    });

    console.log(`Registration successful for ${email}`);
    return user;
  }

  createSession(user: User): string {
    const token = crypto.randomUUID();
    this.sessionStore[token] = { 
      token, 
      user, 
      created: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    return token;
  }

  getCurrentUser(token: string): User | null {
    const session = this.sessionStore[token];
    if (!session) return null;
    
    // Check if session is expired
    if (Date.now() > session.expires) {
      delete this.sessionStore[token];
      return null;
    }
    
    return session.user;
  }

  async init(): Promise<UniversalSDK> {
    console.log('Initializing SDK and seeding demo data...');
    
    // Check if repository exists and is accessible
    try {
      await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}`, {
        headers: this.headers()
      });
      console.log('Repository access confirmed');
    } catch (error) {
      console.error('Repository access failed:', error);
      throw new Error('Cannot access GitHub repository. Please check your credentials.');
    }

    // Seed demo data
    await this.seedDemoData();
    console.log('SDK initialization complete');
    
    return this;
  }

  private async seedDemoData(): Promise<void> {
    console.log('Seeding demo data...');
    
    // Seed demo users
    const existingUsers = await this.get<User>('users');
    if (existingUsers.length === 0) {
      const demoUsers = [
        {
          email: 'demo@textweaverpro.com',
          password: this.hashPassword('demo123'),
          fullName: 'Demo User',
          verified: true,
          roles: ['user'],
          permissions: [],
          walletBalance: 50,
          dailyTextTranslations: 0,
          lastResetDate: new Date().toDateString(),
          isActive: true
        },
        {
          email: 'admin@textweaverpro.com',
          password: this.hashPassword('admin123'),
          fullName: 'Admin User',
          verified: true,
          roles: ['admin', 'user'],
          permissions: ['manage_users', 'manage_content'],
          walletBalance: 100,
          dailyTextTranslations: 0,
          lastResetDate: new Date().toDateString(),
          isActive: true
        }
      ];

      await this.save('users', demoUsers);
      console.log('Demo users seeded successfully');
    }

    // Seed invite codes
    const existingCodes = await this.get('invite_codes');
    if (existingCodes.length === 0) {
      const inviteCodes = [
        {
          code: 'WELCOME2024',
          used: false,
          createdBy: 'system',
          createdFor: 'public',
          usedBy: '',
          createdAt: new Date().toISOString()
        }
      ];

      await this.save('invite_codes', inviteCodes);
      console.log('Invite codes seeded successfully');
    }

    // Seed other collections as needed
    const collections = ['blog_posts', 'documentation', 'transactions', 'invite_requests'];
    for (const collection of collections) {
      const existing = await this.get(collection);
      if (existing.length === 0) {
        await this.save(collection, []);
        console.log(`Initialized empty ${collection} collection`);
      }
    }
  }
}

export default UniversalSDK;
