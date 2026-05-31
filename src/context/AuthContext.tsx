import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { authService } from '../services/firebase/authService';

interface AuthContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = authService.onAuthStateChange((profile) => {
      setUser(profile);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === "prosenjitdey2143@gmail.com" || user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, isAdmin, logout }}>
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
