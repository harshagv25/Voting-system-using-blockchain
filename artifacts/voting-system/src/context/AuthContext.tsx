import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AuthResponse } from '@workspace/api-client-react';

interface AuthState {
  user: AuthResponse | null;
  isAdmin: boolean;
  login: (data: AuthResponse) => void;
  adminLogin: () => void;
  logout: () => void;
  updateUserStatus: (updates: Partial<AuthResponse>) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem('voter_auth');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });

  const login = (data: AuthResponse) => {
    setUser(data);
    localStorage.setItem('voter_auth', JSON.stringify(data));
  };

  const adminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('voter_auth');
    localStorage.removeItem('admin_auth');
  };

  const updateUserStatus = (updates: Partial<AuthResponse>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('voter_auth', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, adminLogin, logout, updateUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
