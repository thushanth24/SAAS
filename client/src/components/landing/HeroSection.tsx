import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const HeroSection: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="bg-white pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Create Your Online Store in Minutes
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              ShopEase helps you build and run your online business with powerful tools 
              that make selling online easy, from product management to secure payments.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => openAuthModal('register')}
                className="bg-primary text-white py-3 px-6 h-auto"
              >
                Start Your Free 14-Day Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border border-gray-300 text-gray-700 py-3 px-6 h-auto flex items-center justify-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5 mr-2 text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Watch Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required. Cancel anytime.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="E-commerce dashboard mockup" 
              className="rounded-lg shadow-xl" 
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5 text-green-600"
                  >
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Sales growing</p>
                  <p className="text-xs text-gray-500">+28% from last month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
