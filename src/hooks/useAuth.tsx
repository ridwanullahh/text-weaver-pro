
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wrappedSDK } from '@/services/sdkService';

interface User {
  id: string;
  email: string;
  fullName?: string;
  walletBalance: number;
  isAdmin: boolean;
  dailyTextTranslations: number;
  lastResetDate: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profile: any) => Promise<void>;
  logout: () => void;
  updateWallet: (amount: number) => Promise<void>;
  canTranslateText: () => boolean;
  incrementTextTranslation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const userData = wrappedSDK.getCurrentUser(token);
        if (userData) {
          setUser({
            id: userData.id || userData.uid || '',
            email: userData.email,
            fullName: userData.fullName,
            walletBalance: userData.walletBalance || 0,
            isAdmin: userData.roles?.includes('admin') || false,
            dailyTextTranslations: userData.dailyTextTranslations || 0,
            lastResetDate: userData.lastResetDate || new Date().toDateString(),
            roles: userData.roles || []
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const token = await wrappedSDK.login(email, password);
      localStorage.setItem('auth_token', token);
      
      const userData = wrappedSDK.getCurrentUser(token);
      if (userData) {
        const userObj = {
          id: userData.id || userData.uid || '',
          email: userData.email,
          fullName: userData.fullName,
          walletBalance: userData.walletBalance || 0,
          isAdmin: userData.roles?.includes('admin') || false,
          dailyTextTranslations: userData.dailyTextTranslations || 0,
          lastResetDate: userData.lastResetDate || new Date().toDateString(),
          roles: userData.roles || []
        };
        setUser(userObj);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, profile: any) => {
    try {
      const newUser = await wrappedSDK.register(email, password, profile);
      const token = await wrappedSDK.login(email, password);
      
      localStorage.setItem('auth_token', token);
      setUser({
        id: newUser.id || newUser.uid || '',
        email: newUser.email,
        fullName: newUser.fullName,
        walletBalance: 0,
        isAdmin: false,
        dailyTextTranslations: 0,
        lastResetDate: new Date().toDateString(),
        roles: newUser.roles || []
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    setUser(null);
  };

  const updateWallet = async (amount: number) => {
    if (!user) return;
    
    try {
      const updatedUser = await wrappedSDK.update('users', user.id, {
        walletBalance: user.walletBalance + amount
      });
      
      // Record transaction
      await wrappedSDK.insert('transactions', {
        userId: user.id,
        amount: amount,
        type: amount > 0 ? 'deposit' : 'withdrawal',
        description: amount > 0 ? 'Wallet funded' : 'Service charge',
        createdAt: new Date().toISOString()
      });
      
      setUser(prev => prev ? { ...prev, walletBalance: updatedUser.walletBalance } : null);
    } catch (error) {
      console.error('Failed to update wallet:', error);
      throw error;
    }
  };

  const canTranslateText = () => {
    if (!user) return false;
    
    const today = new Date().toDateString();
    if (user.lastResetDate !== today) {
      return true; // Reset daily count
    }
    
    return user.dailyTextTranslations < 3;
  };

  const incrementTextTranslation = async () => {
    if (!user) return;
    
    const today = new Date().toDateString();
    let newCount = user.dailyTextTranslations;
    
    if (user.lastResetDate !== today) {
      newCount = 1;
    } else {
      newCount += 1;
    }
    
    try {
      const updatedUser = await wrappedSDK.update('users', user.id, {
        dailyTextTranslations: newCount,
        lastResetDate: today
      });
      
      setUser(prev => prev ? {
        ...prev,
        dailyTextTranslations: updatedUser.dailyTextTranslations,
        lastResetDate: updatedUser.lastResetDate
      } : null);
    } catch (error) {
      console.error('Failed to update daily translations:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateWallet,
        canTranslateText,
        incrementTextTranslation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
