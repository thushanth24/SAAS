import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export interface Store {
  id: number;
  name: string;
  subdomain: string;
  logo?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  stores: Store[];
  login: (email: string, phone: string) => Promise<number | null>;
  register: (data: RegisterData) => Promise<number | null>;
  verifyOtp: (email: string, phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: (view: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalView: 'login' | 'register';
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  storeName: string;
  subdomain: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  stores: [],
  login: async () => null,
  register: async () => null,
  verifyOtp: async () => false,
  logout: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  authModalOpen: false,
  authModalView: 'login',
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await apiRequest('GET', '/api/auth/session');
      const data = await res.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
        setStores(data.stores || []);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setStores([]);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, phone: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', { email, phone });
      const data = await res.json();
      
      if (data.userId) {
        return data.userId;
      }
      return null;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      return null;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await apiRequest('POST', '/api/auth/register', data);
      const result = await res.json();
      
      if (result.userId) {
        return result.userId;
      }
      return null;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      return null;
    }
  };

  const verifyOtp = async (email: string, phone: string, otp: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/verify-otp', { email, phone, otp });
      const data = await res.json();
      
      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        setStores(data.stores || []);
        return true;
      }
      return false;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "OTP verification failed",
        description: error instanceof Error ? error.message : "Invalid or expired OTP",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setIsAuthenticated(false);
      setUser(null);
      setStores([]);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const openAuthModal = (view: 'login' | 'register') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        stores,
        login,
        register,
        verifyOtp,
        logout,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
