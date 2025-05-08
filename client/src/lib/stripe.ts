import { loadStripe, Stripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    try {
      // Handle potential undefined environment variable
      const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      
      if (!key) {
        console.error('Missing Stripe public key. Please set VITE_STRIPE_PUBLIC_KEY in environment variables.');
        return Promise.resolve(null);
      }
      
      stripePromise = loadStripe(key);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      return Promise.resolve(null);
    }
  }
  
  return stripePromise;
};

interface CreatePaymentIntentParams {
  amount: number;
  cartId: number;
}

export const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

interface CompleteCheckoutParams {
  paymentIntentId: string;
  cartId: number;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const completeCheckout = async (params: CompleteCheckoutParams) => {
  try {
    const response = await fetch('/api/checkout/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error completing checkout:', error);
    throw error;
  }
};

interface CreateSubscriptionParams {
  planId: number;
}

export const createSubscription = async (params: CreateSubscriptionParams) => {
  try {
    const response = await fetch('/api/get-or-create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export { getStripe };
