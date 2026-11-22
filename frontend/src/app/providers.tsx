import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}