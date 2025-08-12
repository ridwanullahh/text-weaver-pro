import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  fullName: string;
  walletBalance: number;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  roles?: string[];
  isAdmin?: boolean;
  dailyTextTranslations?: number;
  totalDocuments?: number;
  languagesUsed?: number;
  monthlyPagesUsed?: number;
  monthlyTranslationsUsed?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, additionalData?: { fullName?: string; inviteCode?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateWallet: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('textweaver_user');
        const sessionExpiry = localStorage.getItem('textweaver_session_expiry');
        
        if (savedUser && sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry);
          const currentTime = Date.now();
          
          if (currentTime < expiryTime) {
            // Session is still valid
            const userData = JSON.parse(savedUser);
            setUser(userData);
            console.log('Session restored for user:', userData.email);
          } else {
            // Session expired
            localStorage.removeItem('textweaver_user');
            localStorage.removeItem('textweaver_session_expiry');
            console.log('Session expired, cleared storage');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('textweaver_user');
        localStorage.removeItem('textweaver_session_expiry');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const saveUserSession = (userData: User) => {
    try {
      // Set session to expire in 7 days
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      
      localStorage.setItem('textweaver_user', JSON.stringify(userData));
      localStorage.setItem('textweaver_session_expiry', expiryTime.toString());
      
      console.log('User session saved:', userData.email);
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this would come from your backend
      const userData: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        fullName: email.split('@')[0], // Default fullName
        walletBalance: 10.00, // Starting balance
        plan: 'free',
        roles: email.includes('admin') ? ['admin'] : [],
        isAdmin: email.includes('admin'),
        dailyTextTranslations: 0,
        totalDocuments: 12,
        languagesUsed: 3,
        monthlyPagesUsed: 15,
        monthlyTranslationsUsed: 8
      };
      
      setUser(userData);
      saveUserSession(userData);
      
      console.log('User logged in successfully:', email);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, additionalData?: { fullName?: string; inviteCode?: string }): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: Date.now().toString(),
        email,
        name: additionalData?.fullName || email.split('@')[0],
        fullName: additionalData?.fullName || email.split('@')[0],
        walletBalance: 5.00, // Welcome bonus
        plan: 'free',
        roles: [],
        isAdmin: false,
        dailyTextTranslations: 0,
        totalDocuments: 0,
        languagesUsed: 0,
        monthlyPagesUsed: 0,
        monthlyTranslationsUsed: 0
      };
      
      setUser(userData);
      saveUserSession(userData);
      
      console.log('User registered successfully:', email);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('textweaver_user');
    localStorage.removeItem('textweaver_session_expiry');
    console.log('User logged out');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveUserSession(updatedUser);
    }
  };

  const updateWallet = async (amount: number): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedUser = {
        ...user,
        walletBalance: user.walletBalance + amount
      };
      
      setUser(updatedUser);
      saveUserSession(updatedUser);
      
      console.log(`Wallet updated: +$${amount.toFixed(2)}, New balance: $${updatedUser.walletBalance.toFixed(2)}`);
    } catch (error) {
      console.error('Failed to update wallet:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
