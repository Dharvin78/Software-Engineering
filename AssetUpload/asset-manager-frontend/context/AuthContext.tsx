// context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => Promise<void | boolean>;
  logout: () => void;
  authApi: AxiosInstance;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API_BASE_URL = 'http://localhost:8000/api'; // Django API URL

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 1. Login Function
  const login = async (username: string, password: string): Promise<void | boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/token/`, { username, password });
      
      const { access, refresh } = response.data;
      
      // Store tokens securely (e.g., in HttpOnly cookies in a production setup, 
      // but for simple demo, localStorage is common)
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Simulate fetching user details (optional)
      setUser({ username }); 
      router.push('/upload'); // Redirect to the main page
    } catch (error) {
      console.error("Login failed:", error);
      // Handle error for UI
      return false;
    }
  };

  // 2. Logout Function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
  };

  // 3. Create an Authenticated Axios Instance
  // This automatically attaches the token to every request.
  const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor to attach the token before request
  authApi.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => Promise.reject(error));

  // Interceptor to handle token expiry (401 response) and refresh the token
  // (More complex logic required here for actual refresh, omitted for brevity)
  
  return (
    <AuthContext.Provider value={{ user, login, logout, authApi }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};