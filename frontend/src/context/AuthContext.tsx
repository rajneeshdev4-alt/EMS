import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'sonner';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    
    const handleUnauthorized = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [fetchProfile]);

  const login = async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}