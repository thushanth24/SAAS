import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useStore } from '@/hooks/use-store';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const storeSettingsSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  subdomain: z.string().min(2, "Subdomain must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  logo: z.string().url("Logo must be a valid URL").optional().or(z.literal('')),
});

type StoreSettingsData = z.infer<typeof storeSettingsSchema>;

const StoreSettings: React.FC = () => {
  const { currentStore } = useStore();
  const { toast } = useToast();
  
  const form = useForm<StoreSettingsData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: currentStore?.name || '',
      subdomain: currentStore?.subdomain || '',
      description: currentStore?.description || '',
      logo: currentStore?.logo || '',
    },
  });
  
  // Update store settings
  const updateStoreMutation = useMutation({
    mutationFn: async (data: StoreSettingsData) => {
      return apiRequest('PATCH', `/api/stores/${currentStore?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({
        title: "Store settings updated",
        description: "Your store settings have been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update store settings",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  const onSubmit = (data: StoreSettingsData) => {
    updateStoreMutation.mutate(data);
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
        <title>Store Settings | ShopEase</title>
        <meta name="description" content="Configure your store details, branding, and subdomain settings." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Store Settings" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Manage your store details and branding</CardDescription>
                </CardHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is how your store will appear to customers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subdomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subdomain</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <Input {...field} className="rounded-r-none" />
                                <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                                  .shopease.com
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              This will be your store's URL address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Describe your store and what you sell" 
                                rows={4}
                              />
                            </FormControl>
                            <FormDescription>
                              This will appear on your store's homepage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="https://example.com/your-logo.png" 
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a URL for your store logo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('logo') && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview</p>
                          <div className="w-32 h-32 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                            <img 
                              src={form.watch('logo')} 
                              alt="Logo preview" 
                              className="max-w-full max-h-full" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/128x128?text=Invalid+URL';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => form.reset()}
                        disabled={updateStoreMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateStoreMutation.isPending}
                      >
                        {updateStoreMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Store URL</CardTitle>
                  <CardDescription>Your store's public website address</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-500">Your store is available at:</p>
                    <p className="mt-1 text-primary-600">
                      <a 
                        href={`https://${currentStore.subdomain}.shopease.com`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        https://{currentStore.subdomain}.shopease.com
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your store</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Delete Store</h4>
                      <p className="text-sm text-gray-500">Permanently delete your store and all its data</p>
                    </div>
                    <Button variant="destructive">Delete Store</Button>
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

export default StoreSettings;
