import React from 'react';
import { Link } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';

const CartPage: React.FC = () => {
  const { cartItems, cartTotal, updateItemQuantity, removeItem, cartItemsCount } = useCart();
  
  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Shopping Cart</title>
          <meta name="description" content="View your shopping cart and proceed to checkout." />
        </Helmet>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) return;
    updateItemQuantity(id, quantity);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Shopping Cart ({cartItemsCount} items)</title>
        <meta name="description" content="View your shopping cart and proceed to checkout." />
      </Helmet>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4">
                <div className="col-span-6">
                  <span className="font-medium">Product</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-medium">Price</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-medium">Quantity</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-medium">Subtotal</span>
                </div>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.id} className="border-t border-gray-200 first:border-t-0">
                  <div className="grid grid-cols-1 md:grid-cols-12 p-4 gap-4 items-center">
                    <div className="md:col-span-6 flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400 text-xl">{item.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link href={`/products/${item.id}`}>
                          <a className="font-medium hover:text-primary transition-colors">
                            {item.name}
                          </a>
                        </Link>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-700 mt-1 block"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center md:justify-center">
                      <span className="text-sm md:hidden font-medium mr-2">Price:</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center md:justify-center">
                      <span className="text-sm md:hidden font-medium mr-2">Quantity:</span>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                          type="button"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          className="w-12 h-8 border-y border-gray-300 text-center"
                        />
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="text-sm md:hidden font-medium mr-2">Subtotal:</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-gray-50 p-4 flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
                <Button variant="ghost" onClick={() => window.location.reload()}>
                  Update Cart
                </Button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <h3 className="font-medium">Coupon Code</h3>
                </div>
                <div className="flex space-x-2">
                  <Input placeholder="Enter code" className="flex-1" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-100">
              <h3 className="text-blue-800 font-medium mb-2">Shipping Policy</h3>
              <p className="text-blue-700 text-sm">
                Free shipping on all orders. Items typically ship within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;