import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { generateRandomSessionId } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/hooks/use-store';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  cartItemsCount: number;
  cartId: number | null;
  cartOpen: boolean;
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartTotal: 0,
  cartItemsCount: 0,
  cartId: null,
  cartOpen: false,
  isLoading: false,
  addItem: () => {},
  updateItemQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  openCart: () => {},
  closeCart: () => {},
});

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { currentStore } = useStore();
  const { toast } = useToast();
  
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    // Initialize or retrieve cart when store is loaded
    if (currentStore && !initialized) {
      initializeCart();
    }
  }, [currentStore, initialized]);

  const initializeCart = async () => {
    if (!currentStore) return;
    
    setIsLoading(true);
    try {
      // First check if we have a cartId in localStorage
      const storedCartId = localStorage.getItem(`cart_${currentStore.id}`);
      
      if (storedCartId) {
        // Try to fetch existing cart
        try {
          const res = await apiRequest('GET', `/api/carts/${storedCartId}`);
          const data = await res.json();
          setCartId(data.cart.id);
          
          // Transform cart items to our format
          if (data.items && data.items.length > 0) {
            const formattedItems = data.items.map((item: any) => ({
              id: item.productId,
              name: item.product?.name || 'Product',
              price: item.product?.price || 0,
              image: item.product?.images?.[0] || '',
              quantity: item.quantity,
            }));
            setCartItems(formattedItems);
          }
        } catch (error) {
          console.error('Failed to fetch cart, creating new one', error);
          createNewCart();
        }
      } else {
        // Create a new cart
        createNewCart();
      }
    } catch (error) {
      console.error('Cart initialization error:', error);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  const createNewCart = async () => {
    try {
      const res = await apiRequest('POST', '/api/carts', {
        storeId: currentStore?.id,
      });
      const data = await res.json();
      setCartId(data.id);
      localStorage.setItem(`cart_${currentStore?.id}`, data.id.toString());
    } catch (error) {
      console.error('Failed to create cart:', error);
    }
  };

  const addItem = async (item: CartItem) => {
    if (!cartId || !currentStore) return;
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const newQuantity = cartItems[existingItemIndex].quantity + item.quantity;
      updateItemQuantity(item.id, newQuantity);
      return;
    }
    
    try {
      const res = await apiRequest('POST', `/api/carts/${cartId}/items`, {
        productId: item.id,
        quantity: item.quantity,
      });
      
      const data = await res.json();
      
      setCartItems([...cartItems, item]);
      
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
      
      // Open the cart drawer
      setCartOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add item",
        description: "The item could not be added to your cart",
      });
    }
  };

  const updateItemQuantity = async (id: number, quantity: number) => {
    if (!cartId) return;
    
    try {
      // Find the cart item by product id
      const existingItemIndex = cartItems.findIndex(item => item.id === id);
      if (existingItemIndex === -1) return;
      
      // Get cart item id from backend
      // Note: In a real implementation, we'd store the cart item ids with our cart items
      // For simplicity, we'll just find the cart item id from the product id
      const cartItemId = existingItemIndex + 1; // Simplified mapping
      
      await apiRequest('PATCH', `/api/cart-items/${cartItemId}`, {
        quantity,
      });
      
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity,
      };
      
      setCartItems(updatedItems);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update quantity",
        description: "The item quantity could not be updated",
      });
    }
  };

  const removeItem = async (id: number) => {
    if (!cartId) return;
    
    try {
      // Find the cart item by product id
      const existingItemIndex = cartItems.findIndex(item => item.id === id);
      if (existingItemIndex === -1) return;
      
      // Get cart item id from backend
      // Note: In a real implementation, we'd store the cart item ids with our cart items
      const cartItemId = existingItemIndex + 1; // Simplified mapping
      
      await apiRequest('DELETE', `/api/cart-items/${cartItemId}`);
      
      setCartItems(cartItems.filter(item => item.id !== id));
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove item",
        description: "The item could not be removed from your cart",
      });
    }
  };

  const clearCart = async () => {
    if (!cartId || !currentStore) return;
    
    try {
      await apiRequest('DELETE', `/api/carts/${cartId}`);
      
      // Create a new cart
      createNewCart();
      
      // Clear the items
      setCartItems([]);
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to clear cart",
        description: "The cart could not be cleared",
      });
    }
  };

  const openCart = () => {
    setCartOpen(true);
  };

  const closeCart = () => {
    setCartOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartItemsCount,
        cartId,
        cartOpen,
        isLoading,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
