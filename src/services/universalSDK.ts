// Universal SDK for GitHub-based backend with Cloudinary integration
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
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `token ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request(path: string, method: string = 'GET', body: any = null): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}` +
                (method === 'GET' ? `?ref=${this.branch}` : '');
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : null,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async get<T = any>(collection: string): Promise<T[]> {
    try {
      const res = await this.request(`${this.basePath}/${collection}.json`);
      return JSON.parse(atob(res.content));
    } catch {
      return [];
    }
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    const arr = await this.get<T>(collection);
    return arr.find((x: any) => x.id === key || x.uid === key) || null;
  }

  private async save<T = any>(collection: string, data: T[]): Promise<void> {
    let sha: string | undefined;
    try {
      const head = await this.request(`${this.basePath}/${collection}.json`);
      sha = head.sha;
    } catch {}
    await this.request(`${this.basePath}/${collection}.json`, 'PUT', {
      message: `Update ${collection}`,
      content: btoa(JSON.stringify(data, null, 2)),
      branch: this.branch,
      ...(sha ? { sha } : {}),
    });
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection);
    const id = (Math.max(0, ...arr.map((x: any) => +x.id || 0)) + 1).toString();
    const newItem = { uid: crypto.randomUUID(), id, ...item } as T & { id: string; uid: string };
    arr.push(newItem);
    await this.save(collection, arr);
    return newItem;
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    const arr = await this.get<T>(collection);
    const i = arr.findIndex((x: any) => x.id === key || x.uid === key);
    if (i < 0) throw new Error('Not found');
    const upd = { ...arr[i], ...updates };
    arr[i] = upd;
    await this.save(collection, arr);
    return upd;
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    const arr = await this.get<T>(collection);
    const filtered = arr.filter((x: any) => x.id !== key && x.uid !== key);
    await this.save(collection, filtered);
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
    try {
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
      
      return this.createSession(user);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  }

  async register(email: string, password: string, profile: any): Promise<User> {
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

    const hashed = this.hashPassword(password);
    const user = await this.insert<User>('users', { 
      email, 
      password: hashed, 
      ...profile,
      walletBalance: 0,
      roles: ['user'],
      dailyTextTranslations: 0,
      lastResetDate: new Date().toDateString()
    });

    // Mark invite code as used
    await this.update('invite_codes', validCode.id, {
      used: true,
      usedBy: email
    });

    return user;
  }

  createSession(user: User): string {
    const token = crypto.randomUUID();
    this.sessionStore[token] = { token, user, created: Date.now() };
    return token;
  }

  getCurrentUser(token: string): User | null {
    const session = this.sessionStore[token];
    return session?.user || null;
  }

  async init(): Promise<UniversalSDK> {
    // Test connection and seed demo data if needed
    try {
      await this.get('users');
    } catch {
      await this.seedDemoData();
    }
    return this;
  }

  private async seedDemoData(): Promise<void> {
    console.log('Seeding demo data...');
    
    // Seed demo users with proper password hashes
    const demoUsers = [
      {
        id: '1',
        uid: 'demo-user-1',
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
        id: '2',
        uid: 'admin-user-1',
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

    try {
      await this.save('users', demoUsers);
      console.log('Demo users seeded successfully');
    } catch (error) {
      console.error('Failed to seed demo users:', error);
    }

    // Seed invite codes
    const inviteCodes = [
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
    ];

    await this.save('invite_codes', inviteCodes);

    // Seed blog posts
    const blogPosts = [
      {
        id: '1',
        uid: 'blog-1',
        title: 'Welcome to TextWeaver Pro',
        excerpt: 'Discover how AI-powered document translation can transform your workflow.',
        content: `# Welcome to TextWeaver Pro

TextWeaver Pro represents the next generation of document translation technology. Our platform combines cutting-edge AI with user-friendly design to deliver translations that are not just accurate, but contextually aware and professionally formatted.

## Key Features

- **AI-Powered Translation**: Advanced machine learning models ensure high-quality translations
- **Document Format Preservation**: Maintain original formatting across all document types
- **Multi-Language Support**: Support for 100+ languages and dialects
- **Batch Processing**: Handle multiple documents simultaneously
- **Quality Assurance**: Built-in quality checks and human review options

## Getting Started

1. Upload your documents using our intuitive interface
2. Select your target languages
3. Choose your preferred translation method
4. Review and export your translated documents

Start your translation journey today with TextWeaver Pro!`,
        author: 'TextWeaver Team',
        publishedAt: new Date().toISOString(),
        tags: ['announcement', 'features'],
        featured: true,
        slug: 'welcome-to-textweaver-pro'
      },
      {
        id: '2',
        uid: 'blog-2',
        title: 'The Future of Document Translation',
        excerpt: 'Exploring how AI is revolutionizing the translation industry.',
        content: `# The Future of Document Translation

The translation industry is undergoing a revolutionary transformation. With the advent of advanced AI technologies, what once took hours now takes minutes, and what once required extensive human intervention can now be automated with unprecedented accuracy.

## The Evolution of Translation Technology

From basic word-for-word translation tools to sophisticated AI systems that understand context, nuance, and cultural implications, we've come a long way. Modern translation platforms like TextWeaver Pro leverage:

- **Neural Machine Translation (NMT)**: Deep learning models that understand language patterns
- **Context Awareness**: AI that considers surrounding text for better accuracy
- **Domain Specialization**: Models trained on specific industries and use cases

## What This Means for Businesses

Organizations worldwide are discovering the competitive advantages of advanced translation technology:

- **Faster Time-to-Market**: Rapid localization of products and services
- **Cost Efficiency**: Reduced dependency on human translators for routine tasks
- **Consistency**: Uniform terminology and style across all translated materials
- **Scalability**: Handle large volumes of content without proportional cost increases

The future is here, and it's powered by intelligent translation technology.`,
        author: 'Dr. Sarah Chen',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ['technology', 'ai', 'future'],
        featured: false,
        slug: 'future-of-document-translation'
      }
    ];

    await this.save('blog_posts', blogPosts);

    // Seed documentation
    const docs = [
      {
        id: '1',
        uid: 'doc-1',
        title: 'Getting Started',
        content: `# Getting Started with TextWeaver Pro

Welcome to TextWeaver Pro! This guide will help you get up and running with our powerful document translation platform.

## Account Setup

1. **Registration**: Use your invitation code to create an account
2. **Email Verification**: Check your email and verify your account
3. **Profile Setup**: Complete your profile information

## First Translation

1. **Upload Documents**: Drag and drop your files or click to browse
2. **Select Languages**: Choose source and target languages
3. **Configure Settings**: Adjust translation preferences
4. **Start Translation**: Begin the translation process
5. **Review Results**: Check quality and make adjustments
6. **Export**: Download your translated documents

## Supported File Formats

- PDF documents
- Microsoft Word (.docx)
- Plain text (.txt)
- RTF documents
- CSV files
- Excel spreadsheets (.xlsx)
- HTML files
- XML documents
- JSON files
- EPUB books

## Best Practices

- Use clear, well-structured source documents
- Provide context when possible
- Review translations before finalizing
- Maintain consistent terminology
- Use appropriate translation methods for your content type`,
        category: 'basics',
        order: 1,
        publishedAt: new Date().toISOString()
      },
      {
        id: '2',
        uid: 'doc-2',
        title: 'Translation Methods',
        content: `# Translation Methods

TextWeaver Pro offers multiple translation approaches to suit different needs and document types.

## AI-Powered Translation

Our default method uses advanced neural networks trained on billions of text samples.

**Benefits:**
- High accuracy for most content types
- Fast processing speed
- Context-aware translations
- Continuous learning and improvement

**Best for:**
- Business documents
- Technical manuals
- Marketing materials
- General correspondence

## Traditional Translation

Rule-based translation for specialized content requiring precise terminology.

**Benefits:**
- Consistent terminology
- Predictable results
- Industry-specific accuracy
- Better for technical terms

**Best for:**
- Legal documents
- Medical texts
- Scientific papers
- Regulatory compliance

## Hybrid Approach

Combines AI and traditional methods for optimal results.

**Benefits:**
- Best of both worlds
- Improved accuracy
- Flexible processing
- Quality assurance

**Best for:**
- Complex documents
- Mixed content types
- High-stakes translations
- Quality-critical projects`,
        category: 'advanced',
        order: 2,
        publishedAt: new Date().toISOString()
      }
    ];

    await this.save('documentation', docs);
  }
}

export default UniversalSDK;
