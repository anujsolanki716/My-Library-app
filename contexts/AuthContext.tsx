import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { API_BASE_URL } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>; // Changed username to email
  logout: () => void;
  register: (username: string, email: string, password?: string, role?: Role) => Promise<boolean>; // Added email
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });
        if (response.ok) {
          const user: User = await response.json();
          setCurrentUser(user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setCurrentUser(null);
          if (response.status !== 401) {
             const errData = await response.json();
             setError(errData.message || 'Failed to load user session.');
          }
        }
      } catch (e) {
        console.error("Failed to load user:", e);
        setError("Network error or server unavailable while loading user.");
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => { // Changed username to email
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Send email instead of username
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user); // Assuming backend returns user object under 'user' key
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || "Invalid email or password.");
        setIsLoading(false);
        return false;
      }
    } catch (e) {
      console.error("Login error:", e);
      setError("Login failed. Server may be down or network error.");
      setIsLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password?: string, role: Role = Role.USER): Promise<boolean> => { // Added email
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }), // Send email
      });
      const data = await response.json();
      if (response.ok) {
         setCurrentUser(data.user); // Assuming register also returns user and token under 'user' key
         setToken(data.token);
         localStorage.setItem('token', data.token);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || "Registration failed.");
        setIsLoading(false);
        return false;
      }
    } catch (e) {
      console.error("Registration error:", e);
      setError("Registration failed. Server may be down or network error.");
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, isLoading, error, login, logout, register, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
