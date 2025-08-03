import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  error: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    // Set error state when login or register fails
    if (auth.login.error) {
      setError(auth.login.error);
    } else if (auth.register.error) {
      setError(auth.register.error);
    } else {
      setError(null);
    }
  }, [auth.login.error, auth.register.error]);
  
  const value = {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isLoading: auth.isLoading || auth.login.isLoading || auth.register.isLoading,
    login: async (email: string, password: string) => {
      try {
        await auth.login.mutateAsync({ email, password });
      } catch (error) {
        console.error('Login error:', error);
        setError(error);
        throw error;
      }
    },
    register: async (data: any) => {
      try {
        await auth.register.mutateAsync(data);
      } catch (error) {
        console.error('Registration error:', error);
        setError(error);
        throw error;
      }
    },
    logout: auth.logout,
    error,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;