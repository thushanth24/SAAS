import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

export interface CartItemProps {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartItem: React.FC<{ item: CartItemProps }> = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateItemQuantity(item.id, newQuantity);
    }
  };
  
  const handleIncrease = () => {
    updateItemQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id);
  };
  
  return (
    <div className="flex py-4 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img 
          src={item.image || "https://via.placeholder.com/200x200?text=Product"} 
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>{item.name}</h3>
          <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">{formatCurrency(item.price)} each</p>
        
        <div className="flex items-center justify-between text-sm mt-auto">
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={handleDecrease}
                aria-label="Decrease quantity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={handleQuantityChange}
                className="w-12 h-8 text-center border-none"
                aria-label="Quantity"
              />
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={handleIncrease}
                aria-label="Increase quantity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
