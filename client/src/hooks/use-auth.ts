import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook for accessing authentication context
 * @returns Authentication context with user, authentication state, and auth methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
