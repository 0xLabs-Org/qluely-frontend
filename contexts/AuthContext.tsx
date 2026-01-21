'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  accountType?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
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
        const oldToken = localStorage.getItem('token');
        const currentToken = localStorage.getItem('authToken');

        if (oldToken && !currentToken) {
          console.log('Migrating old token to new storage key');
          localStorage.setItem('authToken', oldToken);
          localStorage.removeItem('token');
        }

        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('User authenticated from localStorage:', parsedUser);
        } else if (token) {
          // If we have a token but no userData, clear the token
          console.log('Found token but no userData, clearing token');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('token'); // Clear old key too
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
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    console.log('AuthContext login completed, user state updated');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('token'); // Clean up old key too
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const value: AuthContextType = { user, isLoading, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
