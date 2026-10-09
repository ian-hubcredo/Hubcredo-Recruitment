import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your account does not have a profile yet. Please contact an administrator.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (profile.role !== allowedRole) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}
