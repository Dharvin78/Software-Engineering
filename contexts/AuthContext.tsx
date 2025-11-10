'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  [x: string]: any;
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: (accessToken?: string) => Promise<void>;
  signup: (data: { email: string; username: string; password: string; password2: string }) => Promise<void>;
  fetchUser: () => Promise<void>; 
  requestPasswordReset: (email: string) => Promise<void>;
  resetPasswordConfirm: (uidb64: string, token: string, password: string) => Promise<string>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // LOGIN
const login = async (email: string, password: string) => {
  try {
    const res = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Read response safely
    let data: any = {};
    const text = await res.text();
    try {
      data = JSON.parse(text); // try parse JSON
    } catch {
      // fallback if response is HTML or plain text
      if (!res.ok) {
        console.error("Server returned non-JSON:", text);
        throw new Error("Login failed: unexpected server response. Check backend logs.");
      }
    }

    if (!res.ok) {
      throw new Error(data.detail || "Invalid email or password");
    }

    // Save token
    setToken(data.access);
    localStorage.setItem("token", data.access);

    // Save user if available, else refresh
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      // ✅ If not, fetch from current-user API
      await fetchUser(data.access);
    }

  } catch (err: any) {
    throw new Error(err?.message || "Network error during login");
  }
};

// SIGNUP
const signup = async (payload: { email: string; username: string; password: string; password2: string }) => {
  const res = await fetch("http://localhost:8000/api/signup/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text(); // read once
  let data: any = {};
  try {
    data = JSON.parse(text); // try parse JSON
  } catch {
    // Not JSON, likely HTML
    console.error("Server returned non-JSON:", text);
    if (!res.ok) throw new Error("Signup failed: unexpected server response. Check backend logs.");
  }

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }
};

  // LOGOUT
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // REFRESH USER
  const refreshUser = async (accessToken?: string) => {
    const t = accessToken || token;
    if (!t) return;

    try {
      const res = await fetch('http://localhost:8000/api/current-user/', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const userData: User = await res.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error(err);
    }
  };

  // ALIAS
  const fetchUser = async (accessToken?: string) => {
  try {
    const t = accessToken || token; 
    if (!t) {
      console.warn("No token available yet, skipping fetchUser()");return;}

    const res = await fetch("http://localhost:8000/api/current-user/", {
      headers: {
        Authorization: `Bearer ${t}`,
      },
    });

      if (!res.ok) throw new Error("Failed to fetch user info");

      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  // PASSWORD RESET
  const requestPasswordReset = async (email: string) => {
    const res = await fetch('http://localhost:8000/api/request-password-reset/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send reset email');
    }
  };

  const resetPasswordConfirm = async (uidb64: string, token: string, password: string) => {
    const res = await fetch('http://localhost:8000/api/password-reset-confirm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uidb64, token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data.message;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        refreshUser,
        signup,
        fetchUser,
        requestPasswordReset,
        resetPasswordConfirm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
