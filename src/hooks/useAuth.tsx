
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk } from '@/services/sdkService';

interface User {
  id: string;
  email: string;
  fullName?: string;
  walletBalance: number;
  isAdmin: boolean;
  dailyTextTranslations: number;
  lastResetDate: string;
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
      const userData = sdk.getCurrentUser(token);
      if (userData) {
        setUser({
          id: userData.id || userData.uid || '',
          email: userData.email,
          fullName: userData.fullName,
          walletBalance: userData.walletBalance || 0,
          isAdmin: userData.roles?.includes('admin') || false,
          dailyTextTranslations: userData.dailyTextTranslations || 0,
          lastResetDate: userData.lastResetDate || new Date().toDateString()
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await sdk.login(email, password);
      if (typeof result === 'string') {
        localStorage.setItem('auth_token', result);
        const userData = sdk.getCurrentUser(result);
        if (userData) {
          setUser({
            id: userData.id || userData.uid || '',
            email: userData.email,
            fullName: userData.fullName,
            walletBalance: userData.walletBalance || 0,
            isAdmin: userData.roles?.includes('admin') || false,
            dailyTextTranslations: userData.dailyTextTranslations || 0,
            lastResetDate: userData.lastResetDate || new Date().toDateString()
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, profile: any) => {
    try {
      // Validate invite code
      const inviteCodes = await sdk.get('invite_codes');
      const validCode = inviteCodes.find((code: any) => 
        code.code === profile.inviteCode && !code.used
      );
      
      if (!validCode) {
        throw new Error('Invalid invitation code');
      }

      const newUser = await sdk.register(email, password, {
        ...profile,
        walletBalance: 0,
        roles: ['user'],
        dailyTextTranslations: 0,
        lastResetDate: new Date().toDateString()
      });

      // Mark invite code as used
      await sdk.update('invite_codes', validCode.id, { used: true, usedBy: newUser.email });

      const token = await sdk.login(email, password);
      if (typeof token === 'string') {
        localStorage.setItem('auth_token', token);
        setUser({
          id: newUser.id || newUser.uid || '',
          email: newUser.email,
          fullName: newUser.fullName,
          walletBalance: 0,
          isAdmin: false,
          dailyTextTranslations: 0,
          lastResetDate: new Date().toDateString()
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateWallet = async (amount: number) => {
    if (!user) return;
    
    const updatedUser = await sdk.update('users', user.id, {
      walletBalance: user.walletBalance + amount
    });
    
    setUser(prev => prev ? { ...prev, walletBalance: updatedUser.walletBalance } : null);
  };

  const canTranslateText = () => {
    if (!user) return false;
    
    const today = new Date().toDateString();
    if (user.lastResetDate !== today) {
      // Reset daily count
      return true;
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
    
    const updatedUser = await sdk.update('users', user.id, {
      dailyTextTranslations: newCount,
      lastResetDate: today
    });
    
    setUser(prev => prev ? {
      ...prev,
      dailyTextTranslations: updatedUser.dailyTextTranslations,
      lastResetDate: updatedUser.lastResetDate
    } : null);
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
