"use client"; // Required for client-side hooks
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";

// Use a centralized axios instance (see frontend/lib/api.ts)
import api, { setAuthToken, setupInterceptors } from "../lib/api";

// 1. Define the shape of your User object
interface User {
  id: number;
  email: string;
  username: string;
  role: "user" | "admin"; // Use the roles from your Django model
}

// 2. Define the shape of the data provided by the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

// 3. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Optionally set up interceptors here. Provide a refresh-token callback
  // if you implement refresh tokens on the backend. For now it's a no-op
  // and acts as a clear placeholder for your partner to implement.
  useEffect(() => {
    // Provide a refresh-token callback to the interceptor.
    // onRefreshToken should return a new access token string or null on failure.
    const onRefreshToken = async () => {
      try {
        const storedRefresh = localStorage.getItem("refresh_token") || refreshToken;
        if (!storedRefresh) return null;
        // Backend expected: POST /token/refresh/ { refresh }
        const resp = await api.post("/token/refresh/", { refresh: storedRefresh });
        const newAccess = resp.data?.access || resp.data?.token || null;
        if (newAccess) {
          // Persist the new access token
          setToken(newAccess);
          setAuthToken(newAccess);
          localStorage.setItem("auth_token", newAccess);
          return newAccess;
        }
      } catch (e) {
        console.error("Refresh token request failed", e);
      }
      return null;
    };

    setupInterceptors(onRefreshToken);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  // This effect runs when the app first loads to check for a token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken) {
        setToken(storedToken);
        const storedRefresh = localStorage.getItem("refresh_token");
        if (storedRefresh) setRefreshToken(storedRefresh);
        // Use shared helper to set auth header
        setAuthToken(storedToken);

        try {
          // Fetch the user's details using the stored token
          const response = await api.get("/me/");
          setUser(response.data);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem("auth_token");
          setToken(null);
          // Use shared helper to remove header
          setAuthToken(null);
        }
      }
      setLoading(false); // Finished loading
    };

    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Login Function ---
  const login = async (email: string, password: string) => {
    try {
      // POST /token/ is expected to return something like { access: string }
      // Adjust according to your backend (e.g., { token } or a JWT pair).
      const tokenResponse = await api.post("/token/", { email, password });
      // Support several common payload shapes
      const access = tokenResponse.data?.access || tokenResponse.data?.token || tokenResponse.data?.access_token || null;
      const refresh = tokenResponse.data?.refresh || tokenResponse.data?.refresh_token || null;

      if (!access) {
        throw new Error("No access token received from server");
      }

      setToken(access);
      localStorage.setItem("auth_token", access);
      setAuthToken(access);

      if (refresh) {
        setRefreshToken(refresh);
        localStorage.setItem("refresh_token", refresh);
      }

      // Fetch the user's details and navigate
      const userResponse = await api.get("/me/");
      setUser(userResponse.data);

      router.push("/assets"); // Redirect to your assets page
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Invalid email or password");
    }
  };

  // --- Signup Function ---
  const signup = async (userData: any) => {
    try {
      await api.post("/register/", userData);
      // Automatically log them in after successful registration
      await login(userData.email, userData.password);
    } catch (error: any) {
      console.error("Signup failed", error);
      if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      throw new Error("An unknown error occurred during signup.");
    }
  };

  // --- Request Password Reset ---
  const requestPasswordReset = async (email: string) => {
    try {
      // Endpoint expected on the Django backend to accept an email and send reset link
      await api.post("/password-reset/", { email });
    } catch (error: any) {
      console.error("Password reset request failed", error);
      if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      throw new Error("Failed to request password reset.");
    }
  };

  // --- Logout Function ---
  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    setAuthToken(null);
    router.push("/login");
  };

  const contextValue = {
    user,
    token,
    loading,
    login,
    signup,
    requestPasswordReset,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Create a custom hook to use the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

