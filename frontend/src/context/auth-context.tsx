"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { clearToken, getToken, saveToken } from "@/lib/auth";
import type { User } from "@/lib/types";
import { useToast } from "./toast-context";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: { username: string; password: string; email?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false));
  }, [fetchMe]);

  const login = useCallback(
    async (username: string, password: string) => {
      const token = await api.login({ username, password });
      saveToken(token.access_token, token.expires_in);
      await fetchMe();
      showToast("success", "Logged in successfully");
      router.push("/");
    },
    [fetchMe, router, showToast],
  );

  const register = useCallback(
    async (payload: { username: string; password: string; email?: string }) => {
      await api.register(payload);
      showToast("success", "Account created, please sign in");
      router.push("/login");
    },
    [router, showToast],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user && getToken()),
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
