import { createContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/auth.service";
import type { CurrentUser } from "../types";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string, turnstileToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    try {
      const currentUser = await authService.me();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));

    function handleUnauthorized() {
      setUser(null);
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  async function login(identifier: string, password: string, turnstileToken: string) {
    const currentUser = await authService.login(identifier, password, turnstileToken);
    setUser(currentUser);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
