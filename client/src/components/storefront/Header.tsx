import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X, User } from 'lucide-react';

interface StorefrontHeaderProps {
  storeName?: string;
  logo?: string;
}

const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({ storeName = 'Shop', logo }) => {
  const [location] = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { cartItemsCount, openCart } = useCart();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand name */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <a className="flex items-center">
                {logo ? (
                  <img 
                    src={logo} 
                    alt={`${storeName} logo`} 
                    className="h-8 w-auto mr-2" 
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-lg font-semibold text-gray-900">{storeName}</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary-600 text-sm font-medium">Home</a>
            </Link>
            <Link href="/products">
              <a className="text-gray-700 hover:text-primary-600 text-sm font-medium">Products</a>
            </Link>
            <Link href="/about">
              <a className="text-gray-700 hover:text-primary-600 text-sm font-medium">About</a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-700 hover:text-primary-600 text-sm font-medium">Contact</a>
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <Link href="/account">
                <a className="p-2 text-gray-600 hover:text-primary-600">
                  <User className="h-5 w-5" />
                </a>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2 text-gray-600"
                onClick={() => openAuthModal('login')}
              >
                <User className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            )}
            
            <button 
              onClick={openCart}
              className="p-2 text-gray-600 hover:text-primary-600 relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t">
            <Link href="/">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                Products
              </a>
            </Link>
            <Link href="/about">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                About
              </a>
            </Link>
            <Link href="/contact">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                Contact
              </a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default StorefrontHeader;