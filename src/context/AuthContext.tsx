"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AppUser, AuthState } from "@/types/user";
import * as authService from "@/services/authService";

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setStatus(u ? "authenticated" : "unauthenticated");
    });
  }, []);

  const value: AuthContextValue = {
    user,
    status,
    signIn: async (email, password) => {
      const u = await authService.signIn(email, password);
      setUser(u);
      setStatus("authenticated");
    },
    signUp: async () => {
      throw new Error("Account creation is disabled.");
    },
    signOut: async () => {
      await authService.signOut();
      setUser(null);
      setStatus("unauthenticated");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
