import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const user = localStorage.getItem('user');

      if (isAuthenticated && user) {
        setAuthenticated(true);
      } else {
        throw new Error('Não autenticado');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthenticated(false);
      toast.error('Sessão expirada. Por favor, faça login novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;