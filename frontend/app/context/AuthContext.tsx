'use client'

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Define the shape of the user object
interface User {
  username: string;
  email: string;
}

// 2. Define the shape of the context's value
interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (userData: { token: string; username: string; email: string }) => void;
  logout: () => void;
}

// 3. Create the context with a default value
// The 'as AuthContextType' is a way to tell TypeScript we'll provide the real value later.
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// 4. Create the Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On initial app load, check localStorage to see if the user is already logged in
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
    setIsLoading(false); // Finished checking, so we're no longer loading
  }, []);

  // Function to handle user login
  const login = (userData: { token: string; username: string; email: string }) => {
    const userToSave: User = { username: userData.username, email: userData.email };
    
    setToken(userData.token);
    setUser(userToSave);
    
    // Save to localStorage so the session persists after a refresh
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userToSave));
  };

  // Function to handle user logout
  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    token,
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Create a custom hook for easy access to the context
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};