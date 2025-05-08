import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import useSubdomain from '@/hooks/use-subdomain';

export interface Store {
  id: number;
  name: string;
  subdomain: string;
  description?: string;
  logo?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  plan?: string;
  active?: boolean;
}

export interface Category {
  id: number;
  storeId: number;
  name: string;
  description?: string;
  image?: string;
}

export interface StorefrontData {
  store: Store;
  categories: Category[];
  featuredProducts: any[];
}

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  storefrontData: StorefrontData | null;
  selectStore: (store: Store) => void;
  isLoading: boolean;
  error: string | null;
}

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreContext = createContext<StoreContextType>({
  currentStore: null,
  stores: [],
  storefrontData: null,
  selectStore: () => {},
  isLoading: false,
  error: null,
});

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [storefrontData, setStorefrontData] = useState<StorefrontData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { stores: authStores, isAuthenticated } = useAuth();
  const { subdomain, isStorefront } = useSubdomain();

  // Initialize stores from auth context when authenticated
  useEffect(() => {
    if (isAuthenticated && authStores && authStores.length > 0) {
      setStores(authStores);
      
      // Set current store if not set already (select first store)
      if (!currentStore) {
        setCurrentStore(authStores[0]);
      }
    }
  }, [isAuthenticated, authStores, currentStore]);

  // Fetch storefront data if subdomain is present
  useEffect(() => {
    if (isStorefront && subdomain) {
      fetchStorefrontData();
    }
  }, [isStorefront, subdomain]);

  const fetchStorefrontData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest('GET', '/api/storefront');
      const data = await res.json();
      
      setStorefrontData(data);
      setCurrentStore(data.store);
    } catch (error) {
      console.error('Failed to fetch storefront data:', error);
      setError('Failed to load store data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectStore = (store: Store) => {
    setCurrentStore(store);
    localStorage.setItem('selectedStoreId', store.id.toString());
  };

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        stores,
        storefrontData,
        selectStore,
        isLoading,
        error,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
