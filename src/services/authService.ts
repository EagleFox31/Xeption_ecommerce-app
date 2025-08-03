import apiClient from './api-client';
import { LoginCredentials, RegisterData, UserProfile, AuthResponse, AuthValidationResult } from '../types/auth';

export const authService = {
  // Login function - since we saw Supabase in the project, we're making it compatible with both options
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // We're calling a hypothetical login endpoint or using Supabase
      // In a real implementation, you'd need to check how auth is actually handled
      const response = await apiClient.post<AuthResponse>('/v1/auth/login', credentials);
      
      // Store the token and user data
      if (response.data.access_token) {
        localStorage.setItem('xeption_auth_token', response.data.access_token);
        localStorage.setItem('xeption_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register function
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/v1/auth/register', data);
      
      // Optionally auto-login after registration by storing token
      if (response.data.access_token) {
        localStorage.setItem('xeption_auth_token', response.data.access_token);
        localStorage.setItem('xeption_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Get current user profile from API
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<{success: boolean, data: UserProfile}>('/v1/auth/me');
    return response.data.data;
  },
  
  // Validate token
  validateToken: async (): Promise<AuthValidationResult> => {
    const response = await apiClient.get<{success: boolean, data: AuthValidationResult}>('/v1/auth/validate');
    return response.data.data;
  },
  
  // Logout function
  logout: () => {
    localStorage.removeItem('xeption_auth_token');
    localStorage.removeItem('xeption_user');
    // Redirect to login page happens in the component
  },
  
  // Check if user is authenticated (has token)
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('xeption_auth_token');
  },
  
  // Get current user from localStorage
  getCurrentUser: (): UserProfile | null => {
    const userData = localStorage.getItem('xeption_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        localStorage.removeItem('xeption_user');
      }
    }
    return null;
  }
};

export default authService;