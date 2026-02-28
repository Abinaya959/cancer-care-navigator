import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Role } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@ccipx.com': { id: '1', name: 'Admin Kumar', email: 'admin@ccipx.com', role: 'admin', password: 'demo123' },
  'doctor@ccipx.com': { id: '2', name: 'Dr. Sarah Chen', email: 'doctor@ccipx.com', role: 'doctor', password: 'demo123' },
  'officer@ccipx.com': { id: '3', name: 'Officer Patel', email: 'officer@ccipx.com', role: 'health_officer', password: 'demo123' },
  'public@ccipx.com': { id: '4', name: 'Public User', email: 'public@ccipx.com', role: 'public_user', password: 'demo123' },
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ccipx_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email: string, password: string) => {
    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      const { password: _, ...userData } = demoUser;
      setUser(userData);
      localStorage.setItem('ccipx_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ccipx_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
