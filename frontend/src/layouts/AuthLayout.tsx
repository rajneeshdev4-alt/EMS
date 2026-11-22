import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthLayout() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}