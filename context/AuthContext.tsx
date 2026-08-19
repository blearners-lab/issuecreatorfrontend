"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "@/lib/auth";
import { getCurrentUser, logout as logoutUser, isAuthenticated, getAuthHeader } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { login: loginUser } = await import("@/lib/auth");
    const result = await loginUser({ email, password });
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const register = async (email: string, password: string, name: string) => {
    const { register: registerUser } = await import("@/lib/auth");
    const result = await registerUser({ email, password, name });
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}