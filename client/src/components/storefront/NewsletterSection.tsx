import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API endpoint
      // to save the newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      
      setEmail('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Subscribe to our Newsletter</h2>
            <p className="mt-4 text-primary-100">
              Get the latest updates on new products and upcoming sales.
            </p>
          </div>
          <div>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white flex-1"
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-primary-600 py-3 px-6 rounded-md hover:bg-gray-100 transition duration-200 font-medium whitespace-nowrap"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;
