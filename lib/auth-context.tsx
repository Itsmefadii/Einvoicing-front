'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authManager, User, AuthSession } from './auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = () => {
    const session = authManager.getSession();
    if (session) {
      setUser(session.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await authManager.login(email, password);
    if (result.success) {
      refreshSession();
    }
    return result;
  };

  const logout = () => {
    authManager.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Initialize auth state on mount
    refreshSession();
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
