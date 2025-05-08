import { useContext } from 'react';
import { StoreContext } from '@/contexts/StoreContext';

/**
 * Hook for accessing store context
 * @returns Store context with current store, store selection, and storefront data
 */
export function useStore() {
  const context = useContext(StoreContext);
  
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  
  return context;
}
