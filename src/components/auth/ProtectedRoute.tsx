import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const location = useLocation();
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <span className="ml-2">Vérification de l'authentification...</span>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Check for required roles if specified
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = user.role && requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }
  
  // User is authenticated and has required roles (if any)
  return <>{children}</>;
};

export default ProtectedRoute;