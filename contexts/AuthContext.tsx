'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/storage';

interface User {
  id: string;
  email: string;
  accountType?: string;
  isOnboarded?: boolean;
  onboardingSkipped?: boolean;
  creditsUsed?: number; // Added globally
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  setOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth token on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          // console.log('User authenticated from localStorage:', parsedUser);
        } else if (token) {
          // If we have a token but no userData, clear the token
          // console.log('Found token but no userData, clearing token');
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
      } catch (error) {
        // console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for logout events from other parts of the app (e.g., payment service)
    const handleLogout = () => {
      console.log('Auth logout event received, clearing user state');
      setUser(null);
    };

    // Listen for explicit refresh events (e.g., after payment completes)
    const handleRefresh = () => {
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          const parsed = JSON.parse(userData);
          // console.log('Auth refresh received, updating user from localStorage:', parsed);
          setUser(parsed);
        }
      } catch (e) {
        console.error('Failed to refresh auth from localStorage', e);
      }
    };

    window.addEventListener('auth-logout', handleLogout);
    window.addEventListener('auth-refresh', handleRefresh);

    return () => {
      window.removeEventListener('auth-logout', handleLogout);
      window.removeEventListener('auth-refresh', handleRefresh);
    };
  }, []);

  const login = (token: string, userData: User) => {
    // console.log('AuthContext login called with:', {
    //   token: token.substring(0, 20) + '...',
    //   userData,
    // });
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    setUser(userData);
    // console.log('AuthContext login completed, user state updated');
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    setUser(userData);
  };

  const setOnboardingComplete = () => {
    if (user) {
      const updatedUser = { ...user, isOnboarded: true };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    setOnboardingComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
