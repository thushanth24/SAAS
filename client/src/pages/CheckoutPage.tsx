import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, 
} from '@/components/ui/card';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe with the publishable key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null; // Handle missing key gracefully

// Define the shipping info form schema
const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// Checkout form that collects shipping information
const CheckoutForm: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");
  
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  
  // Initialize Stripe payment intent when the page loads
  useEffect(() => {
    if (cartItems.length === 0) return;
    
    // Only create payment intent when moving to step 2
    if (step !== 2) return;
    
    const createPaymentIntent = async () => {
      try {
        // Check for cart ID
        const cartId = sessionStorage.getItem('cartId') ? 
          parseInt(sessionStorage.getItem('cartId') || '0') : 1;
          
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          cartId: cartId,
          amount: cartTotal,
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    createPaymentIntent();
  }, [cartItems, cartTotal, step, toast]);
  
  const createOrderMutation = useMutation({
    mutationFn: async (data: ShippingFormData) => {
      return apiRequest("POST", "/api/orders", {
        ...data,
        items: cartItems,
        total: cartTotal,
      });
    },
    onSuccess: () => {
      // Order created successfully, move to payment step
      setStep(2);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ShippingFormData) => {
    createOrderMutation.mutate(data);
  };
  
  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0) {
      setLocation("/cart");
    }
  }, [cartItems]);
  
  if (cartItems.length === 0) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Checkout</title>
        <meta name="description" content="Complete your purchase by providing shipping and payment information." />
      </Helmet>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          {/* Checkout Steps */}
          <div className="flex mb-8">
            <div className={`flex-1 pb-2 ${step === 1 ? 'border-b-2 border-primary' : 'border-b'}`}>
              <span className={`inline-block rounded-full w-6 h-6 ${step === 1 ? 'bg-primary' : 'bg-gray-300'} text-white text-xs flex items-center justify-center mr-2`}>1</span>
              <span className={step === 1 ? 'font-medium' : 'text-gray-500'}>Shipping</span>
            </div>
            <div className={`flex-1 pb-2 ${step === 2 ? 'border-b-2 border-primary' : 'border-b'}`}>
              <span className={`inline-block rounded-full w-6 h-6 ${step === 2 ? 'bg-primary' : 'bg-gray-300'} text-white text-xs flex items-center justify-center mr-2`}>2</span>
              <span className={step === 2 ? 'font-medium' : 'text-gray-500'}>Payment</span>
            </div>
            <div className={`flex-1 pb-2 ${step === 3 ? 'border-b-2 border-primary' : 'border-b'}`}>
              <span className={`inline-block rounded-full w-6 h-6 ${step === 3 ? 'bg-primary' : 'bg-gray-300'} text-white text-xs flex items-center justify-center mr-2`}>3</span>
              <span className={step === 3 ? 'font-medium' : 'text-gray-500'}>Confirmation</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Enter your shipping details to continue</CardDescription>
                  </CardHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP/Postal Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between border-t pt-6">
                        <Button variant="outline" type="button" asChild>
                          <Link href="/cart">Back to Cart</Link>
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createOrderMutation.isPending}
                        >
                          {createOrderMutation.isPending ? "Processing..." : "Continue to Payment"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              )}
              
              {step === 2 && clientSecret && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>Enter your payment details to complete your purchase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!import.meta.env.VITE_STRIPE_PUBLIC_KEY ? (
                      <div className="p-4 bg-amber-50 text-amber-700 rounded-md mb-4">
                        <h3 className="font-medium">Stripe API key not configured</h3>
                        <p>Please set the VITE_STRIPE_PUBLIC_KEY environment variable to enable payments.</p>
                        <Button className="mt-4" onClick={() => setStep(1)}>
                          Back to Shipping
                        </Button>
                      </div>
                    ) : (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentForm 
                          onComplete={() => setStep(3)} 
                          onBack={() => setStep(1)}
                        />
                      </Elements>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Confirmation</CardTitle>
                    <CardDescription>Thank you for your purchase!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Payment Successful</h3>
                      <p className="text-gray-600">Your order has been placed and is being processed.</p>
                      <p className="text-gray-600 mt-2">
                        A confirmation email has been sent to your email address.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Order Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-500">Order Number:</span>
                        <span className="font-medium">ORD-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
                        <span className="text-gray-500">Order Date:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="font-medium">Credit Card</span>
                        <span className="text-gray-500">Order Total:</span>
                        <span className="font-medium">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center border-t pt-6">
                    <Button 
                      onClick={() => {
                        clearCart();
                        setLocation("/");
                      }}
                    >
                      Continue Shopping
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden mr-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400">{item.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500 block">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(cartTotal * 0.05).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(cartTotal + (cartTotal * 0.05)).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-blue-800 font-medium mb-2">Need Help?</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Our customer service team is here to help you with any questions.
                </p>
                <p className="text-blue-700 text-sm">
                  Email: <a href="mailto:support@shopease.com" className="underline">support@shopease.com</a>
                </p>
                <p className="text-blue-700 text-sm">
                  Phone: <a href="tel:+1234567890" className="underline">+1 (234) 567-890</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Stripe payment form component
const StripePaymentForm: React.FC<{
  onComplete: () => void;
  onBack: () => void;
}> = ({ onComplete, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // Use effect to check Stripe and Elements availability
  useEffect(() => {
    if (!stripe || !elements) {
      console.log("Stripe or Elements are not yet available");
    } else {
      console.log("Stripe and Elements are ready to use");
    }
  }, [stripe, elements]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Payment Processing Error",
        description: "The payment system is not fully loaded. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(undefined);
    
    try {
      // Get a reference to a mounted CardElement
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/order-confirmation",
        },
        redirect: 'if_required',
      });
      
      if (result.error) {
        setErrorMessage(result.error.message);
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        // Success - no error message from Stripe
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        onComplete();
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      setErrorMessage(error?.message || "An unexpected error occurred during payment processing");
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Shipping
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Processing..." : "Complete Order"}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;