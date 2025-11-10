"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import api, { setAuthToken, setupInterceptors } from "@/lib/api";

interface User {
  id: number;
  email: string;
  username: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: any) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupInterceptors(async () => null); // token refresh placeholder
  }, [refreshToken]);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        setToken(storedToken);
        const storedRefresh = localStorage.getItem("refresh_token");
        if (storedRefresh) setRefreshToken(storedRefresh);
        setAuthToken(storedToken);
        try {
          const resp = await api.get("/me/");
          setUser(resp.data);
        } catch {
          localStorage.removeItem("auth_token");
          setToken(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const tokenResp = await api.post("/token/", { email, password });
    const access = tokenResp.data?.access || tokenResp.data?.token;
    const refresh = tokenResp.data?.refresh || tokenResp.data?.refresh_token;

    if (!access) throw new Error("No access token received");

    setToken(access);
    localStorage.setItem("auth_token", access);
    setAuthToken(access);

    if (refresh) {
      setRefreshToken(refresh);
      localStorage.setItem("refresh_token", refresh);
    }

    const userResp = await api.get("/me/");
    setUser(userResp.data);
    return userResp.data;
  };

  const signup = async (userData: any) => {
    await api.post("/register/", userData);
    return login(userData.email, userData.password);
  };

  const requestPasswordReset = async (email: string) => {
    await api.post("/password-reset/", { email });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, requestPasswordReset, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
