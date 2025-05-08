import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';

const Header: React.FC = () => {
  const [location] = useLocation();
  const { isAuthenticated, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-primary-600 text-2xl font-bold cursor-pointer">ShopEase</span>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary-600 text-sm font-medium">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-primary-600 text-sm font-medium">Pricing</a>
            <a href="#testimonials" className="text-gray-700 hover:text-primary-600 text-sm font-medium">Testimonials</a>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <a className="text-primary-600 hover:text-primary-700 text-sm font-medium">Dashboard</a>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => logout()}
                  className="text-sm font-medium"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => openAuthModal('login')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Sign In
                </Button>
                <Link href="/setup">
                  <Button 
                    className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-200 text-sm font-medium"
                  >
                    Create Store
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              type="button" 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-1">
            <a href="#features" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">Features</a>
            <a href="#pricing" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">Pricing</a>
            <a href="#testimonials" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">Testimonials</a>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <a className="block pl-3 pr-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-gray-50 rounded-md">Dashboard</a>
                </Link>
                <button 
                  onClick={() => logout()}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-gray-50 rounded-md"
                >
                  Sign In
                </button>
                <Link href="/setup">
                  <a className="block pl-3 pr-4 py-2 text-base font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-md">
                    Create Store
                  </a>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
