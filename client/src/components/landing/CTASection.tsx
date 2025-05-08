import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const CTASection: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="bg-primary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Selling Online?</h2>
          <p className="mt-4 max-w-2xl text-xl text-primary-100 mx-auto">
            Join thousands of businesses already growing with ShopEase.
          </p>
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg"
              onClick={() => openAuthModal('register')}
              className="bg-white text-primary hover:bg-gray-100 py-3 px-8 h-auto font-medium"
            >
              Start Your Free 14-Day Trial
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-100">No credit card required. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
