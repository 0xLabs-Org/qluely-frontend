'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  accountType?: string;
  isOnboarded?: boolean;
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
        // Migration: check for old token key and move to new key
        const oldToken = localStorage.getItem('authToken');
        const currentToken = localStorage.getItem('token');

        if (oldToken && !currentToken) {
          console.log('Migrating old authToken to new storage key');
          localStorage.setItem('token', oldToken);
          localStorage.removeItem('authToken');
        }

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('User authenticated from localStorage:', parsedUser);
        } else if (token) {
          // If we have a token but no userData, clear the token
          console.log('Found token but no userData, clearing token');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken'); // Clear old key too
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    console.log('AuthContext login called with:', {
      token: token.substring(0, 20) + '...',
      userData,
    });
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    console.log('AuthContext login completed, user state updated');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken'); // Clean up old key too
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const setOnboardingComplete = () => {
    if (user) {
      const updatedUser = { ...user, isOnboarded: true };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
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
