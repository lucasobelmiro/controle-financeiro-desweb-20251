import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import {
  getCurrentUser,
  clearSession,
  saveSession,
  loginRequest,
} from "../services/auth";

type AuthCtx = {
  user: User | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setReady(true);
  }, []);

  async function login(email: string, password: string) {
    const data = await loginRequest(email, password);
    saveSession(data);
    setUser(data.user);
    setReady(true);
  }

  function logout() {
    clearSession();
    setUser(null);
    setReady(true);
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, ready, login, logout }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de <AuthProvider/>");
  return ctx;
}
