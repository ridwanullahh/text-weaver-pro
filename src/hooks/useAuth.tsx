
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
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('current_user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Validate token is still valid
          try {
            const currentUser = wrappedSDK.getCurrentUser(token);
            if (currentUser) {
              setUser({
                id: currentUser.id || currentUser.uid || parsedUser.id,
                email: currentUser.email || parsedUser.email,
                fullName: currentUser.fullName || parsedUser.fullName,
                walletBalance: currentUser.walletBalance || parsedUser.walletBalance || 0,
                isAdmin: currentUser.roles?.includes('admin') || parsedUser.isAdmin || false,
                dailyTextTranslations: currentUser.dailyTextTranslations || parsedUser.dailyTextTranslations || 0,
                lastResetDate: currentUser.lastResetDate || parsedUser.lastResetDate || new Date().toDateString(),
                roles: currentUser.roles || parsedUser.roles || []
              });
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('auth_token');
              localStorage.removeItem('current_user');
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
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
        
        // Persist user data
        localStorage.setItem('current_user', JSON.stringify(userObj));
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
      
      const userObj = {
        id: newUser.id || newUser.uid || '',
        email: newUser.email,
        fullName: newUser.fullName,
        walletBalance: 0,
        isAdmin: false,
        dailyTextTranslations: 0,
        lastResetDate: new Date().toDateString(),
        roles: newUser.roles || []
      };
      
      localStorage.setItem('current_user', JSON.stringify(userObj));
      setUser(userObj);
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
      
      const updatedUserObj = { ...user, walletBalance: updatedUser.walletBalance };
      localStorage.setItem('current_user', JSON.stringify(updatedUserObj));
      setUser(updatedUserObj);
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
      
      const updatedUserObj = {
        ...user,
        dailyTextTranslations: updatedUser.dailyTextTranslations,
        lastResetDate: updatedUser.lastResetDate
      };
      
      localStorage.setItem('current_user', JSON.stringify(updatedUserObj));
      setUser(updatedUserObj);
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
