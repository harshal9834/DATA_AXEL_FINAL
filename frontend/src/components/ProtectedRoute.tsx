import React, { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return <>{children}</>;
};
