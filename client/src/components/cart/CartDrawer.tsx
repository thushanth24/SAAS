import React from 'react';
import { Link } from 'wouter';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CartItem from './CartItem';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';

const CartDrawer: React.FC = () => {
  const { 
    cartOpen, 
    closeCart, 
    cartItems, 
    cartTotal, 
    clearCart 
  } = useCart();
  
  return (
    <Sheet open={cartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-[350px] sm:w-[450px] p-0">
        <div className="flex h-full flex-col overflow-y-auto bg-white p-6">
          <SheetHeader className="space-y-2 mb-6">
            <SheetTitle className="text-xl">Shopping Cart</SheetTitle>
            <Separator />
          </SheetHeader>
          
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
              <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
              <p className="text-sm text-gray-500">Start adding items to your cart.</p>
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  asChild
                  className="mt-4"
                >
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-6">
                        <CartItem item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-base font-medium text-gray-900">Subtotal</div>
                  <div className="text-base font-medium text-gray-900">{formatCurrency(cartTotal)}</div>
                </div>
                <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  
                  <SheetClose asChild>
                    <Button asChild>
                      <Link href="/checkout">
                        Checkout
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
                
                <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                  <SheetClose asChild>
                    <Link href="/">
                      <span className="font-medium text-primary-600 hover:text-primary-500">
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </span>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
