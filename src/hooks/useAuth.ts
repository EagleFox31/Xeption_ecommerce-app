import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authService } from '../services/authService';
import { LoginCredentials, RegisterData } from '../types/auth';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Mutation for login
  const login = useMutation(
    (credentials: LoginCredentials) => authService.login(credentials),
    {
      onSuccess: (data) => {
        // Invalidate user query to force refetch
        queryClient.invalidateQueries('user');
        
        // Redirect to homepage after successful login
        navigate('/');
      },
    }
  );
  
  // Mutation for registration
  const register = useMutation(
    (data: RegisterData) => authService.register(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('user');
        navigate('/');
      },
    }
  );
  
  // Query for user profile
  const userProfile = useQuery(
    'user',
    () => authService.getProfile(),
    {
      // Only run this query if we have a token
      enabled: authService.isAuthenticated(),
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        // If unauthorized, clear local storage
        if (error?.response?.status === 401) {
          authService.logout();
        }
      }
    }
  );
  
  // Mutation for logout
  const logoutMutation = useMutation(
    () => {
      authService.logout();
      return Promise.resolve();
    },
    {
      onSuccess: () => {
        // Clear all queries in the cache
        queryClient.clear();
        
        // Redirect to login page
        navigate('/auth/login');
      }
    }
  );
  
  // Simplified logout function
  const logout = () => {
    logoutMutation.mutate();
  };
  
  return {
    login,
    register,
    userProfile,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    user: userProfile.data || authService.getCurrentUser(),
    isLoading: userProfile.isLoading,
    isError: userProfile.isError,
  };
};

export default useAuth;