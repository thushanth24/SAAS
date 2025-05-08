import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useStore } from '@/hooks/use-store';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet';
import { SiStripe } from 'react-icons/si';

const paymentSettingsSchema = z.object({
  stripePublishableKey: z.string().min(10, "Stripe publishable key is required").optional(),
  stripeSecretKey: z.string().min(10, "Stripe secret key is required").optional(),
  enabledPaymentMethods: z.object({
    card: z.boolean().default(true),
    applePay: z.boolean().default(false),
    googlePay: z.boolean().default(false),
  }).default({
    card: true,
    applePay: false,
    googlePay: false,
  }),
});

type PaymentSettingsData = z.infer<typeof paymentSettingsSchema>;

const PaymentSettings: React.FC = () => {
  const { currentStore } = useStore();
  const { toast } = useToast();
  
  const form = useForm<PaymentSettingsData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      stripePublishableKey: '',
      stripeSecretKey: '',
      enabledPaymentMethods: {
        card: true,
        applePay: false,
        googlePay: false,
      },
    },
  });
  
  // Update payment settings
  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (data: PaymentSettingsData) => {
      return apiRequest('PATCH', `/api/stores/${currentStore?.id}/payment-settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({
        title: "Payment settings updated",
        description: "Your payment settings have been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update payment settings",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  const onSubmit = (data: PaymentSettingsData) => {
    updatePaymentSettingsMutation.mutate(data);
  };
  
  if (!currentStore) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Please select a store to continue</p>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Payment Settings | ShopEase</title>
        <meta name="description" content="Configure payment methods, gateways, and processing options for your store." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Payment Settings" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <div className="text-3xl text-primary">
                    <SiStripe />
                  </div>
                  <div>
                    <CardTitle>Stripe Integration</CardTitle>
                    <CardDescription>Connect your Stripe account to process payments</CardDescription>
                  </div>
                </CardHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Stripe API Keys</h4>
                        <p className="text-sm text-blue-600">
                          To process payments, you'll need to connect your Stripe account.
                          Get your API keys from the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a>.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="stripePublishableKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publishable Key</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="pk_..." className="font-mono" />
                            </FormControl>
                            <FormDescription>
                              Your Stripe publishable key (starts with pk_)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stripeSecretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Key</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password"
                                placeholder="sk_..." 
                                className="font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              Your Stripe secret key (starts with sk_)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium mb-3">Payment Methods</h4>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="enabledPaymentMethods.card"
                            render={({ field }) => (
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                />
                                <div>
                                  <p className="text-sm font-medium">Credit & Debit Cards</p>
                                  <p className="text-xs text-gray-500">Accept Visa, Mastercard, Amex, and other major cards</p>
                                </div>
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="enabledPaymentMethods.applePay"
                            render={({ field }) => (
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                />
                                <div>
                                  <p className="text-sm font-medium">Apple Pay</p>
                                  <p className="text-xs text-gray-500">Allow customers to pay with Apple Pay on supported devices</p>
                                </div>
                              </div>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="enabledPaymentMethods.googlePay"
                            render={({ field }) => (
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                />
                                <div>
                                  <p className="text-sm font-medium">Google Pay</p>
                                  <p className="text-xs text-gray-500">Allow customers to pay with Google Pay on supported devices</p>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t pt-6">
                      <Button 
                        type="submit"
                        disabled={updatePaymentSettingsMutation.isPending}
                      >
                        {updatePaymentSettingsMutation.isPending ? "Saving..." : "Save Payment Settings"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment Test Mode</CardTitle>
                  <CardDescription>Test your payment flow before going live</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Test Card Information</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Use these test card details to simulate transactions in test mode:
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-yellow-200 font-mono text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Number:</span> 4242 4242 4242 4242
                        </div>
                        <div>
                          <span className="text-gray-500">CVC:</span> Any 3 digits
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span> Any future date
                        </div>
                        <div>
                          <span className="text-gray-500">ZIP:</span> Any 5 digits
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PaymentSettings;