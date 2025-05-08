import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { useCart } from '@/hooks/use-cart';

const StoreHeader: React.FC = () => {
  const [location] = useLocation();
  const { currentStore } = useStore();
  const { openCart, cartItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  if (!currentStore) {
    return null;
  }
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0">
                {currentStore.logo ? (
                  <img 
                    src={currentStore.logo} 
                    alt={`${currentStore.name} logo`} 
                    className="h-8 w-auto" 
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {currentStore.name}
                  </span>
                )}
              </a>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/">
              <a className={`text-gray-700 hover:text-primary-600 ${location === '/' ? 'text-primary-600' : ''}`}>
                Home
              </a>
            </Link>
            <Link href="/shop">
              <a className={`text-gray-700 hover:text-primary-600 ${location === '/shop' ? 'text-primary-600' : ''}`}>
                Shop
              </a>
            </Link>
            <Link href="/categories">
              <a className={`text-gray-700 hover:text-primary-600 ${location === '/categories' ? 'text-primary-600' : ''}`}>
                Categories
              </a>
            </Link>
            <Link href="/about">
              <a className={`text-gray-700 hover:text-primary-600 ${location === '/about' ? 'text-primary-600' : ''}`}>
                About
              </a>
            </Link>
            <Link href="/contact">
              <a className={`text-gray-700 hover:text-primary-600 ${location === '/contact' ? 'text-primary-600' : ''}`}>
                Contact
              </a>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-700 hover:text-primary-600"
              aria-label="Search"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
            
            <Link href="/account">
              <a className="text-gray-700 hover:text-primary-600">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </a>
            </Link>
            
            <button 
              className="text-gray-700 hover:text-primary-600 relative"
              onClick={openCart}
              aria-label={`Shopping cart with ${cartItemsCount} items`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
            
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                type="button" 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 space-y-1">
            <Link href="/">
              <a className={`block px-3 py-2 rounded-md ${location === '/' ? 'text-primary-600 bg-gray-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}>
                Home
              </a>
            </Link>
            <Link href="/shop">
              <a className={`block px-3 py-2 rounded-md ${location === '/shop' ? 'text-primary-600 bg-gray-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}>
                Shop
              </a>
            </Link>
            <Link href="/categories">
              <a className={`block px-3 py-2 rounded-md ${location === '/categories' ? 'text-primary-600 bg-gray-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}>
                Categories
              </a>
            </Link>
            <Link href="/about">
              <a className={`block px-3 py-2 rounded-md ${location === '/about' ? 'text-primary-600 bg-gray-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}>
                About
              </a>
            </Link>
            <Link href="/contact">
              <a className={`block px-3 py-2 rounded-md ${location === '/contact' ? 'text-primary-600 bg-gray-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}>
                Contact
              </a>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default StoreHeader;
