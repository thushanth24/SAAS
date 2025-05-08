import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const themeSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  fontFamily: z.string(),
});

type ThemeSettingsData = z.infer<typeof themeSettingsSchema>;

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
];

const ThemeSettings: React.FC = () => {
  const { currentStore } = useStore();
  const { toast } = useToast();
  const [previewStyle, setPreviewStyle] = useState({
    primaryColor: currentStore?.theme?.primaryColor || '#4F46E5',
    secondaryColor: currentStore?.theme?.secondaryColor || '#f97316',
    fontFamily: currentStore?.theme?.fontFamily || 'Inter',
  });
  
  const form = useForm<ThemeSettingsData>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      primaryColor: currentStore?.theme?.primaryColor || '#4F46E5',
      secondaryColor: currentStore?.theme?.secondaryColor || '#f97316',
      fontFamily: currentStore?.theme?.fontFamily || 'Inter',
    },
  });
  
  // Watch form values for live preview
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setPreviewStyle({
        primaryColor: value.primaryColor || previewStyle.primaryColor,
        secondaryColor: value.secondaryColor || previewStyle.secondaryColor,
        fontFamily: value.fontFamily || previewStyle.fontFamily,
      });
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Update theme settings
  const updateThemeMutation = useMutation({
    mutationFn: async (data: ThemeSettingsData) => {
      return apiRequest('PATCH', `/api/stores/${currentStore?.id}`, {
        theme: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({
        title: "Theme settings updated",
        description: "Your store theme has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update theme",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  const onSubmit = (data: ThemeSettingsData) => {
    updateThemeMutation.mutate(data);
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
        <title>Theme Settings | ShopEase</title>
        <meta name="description" content="Customize your store's appearance with colors, fonts, and layout options." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Theme Settings" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme Customization</CardTitle>
                      <CardDescription>Customize your store's appearance</CardDescription>
                    </CardHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-8 h-8 rounded-md border border-gray-200"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <FormControl>
                                    <Input {...field} type="text" />
                                  </FormControl>
                                  <Input 
                                    type="color" 
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="w-10 h-10 p-1 rounded-md"
                                  />
                                </div>
                                <FormDescription>
                                  Used for buttons, links, and primary actions
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Color</FormLabel>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-8 h-8 rounded-md border border-gray-200"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <FormControl>
                                    <Input {...field} type="text" />
                                  </FormControl>
                                  <Input 
                                    type="color" 
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="w-10 h-10 p-1 rounded-md"
                                  />
                                </div>
                                <FormDescription>
                                  Used for accents, highlights, and secondary elements
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="fontFamily"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Font Family</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a font" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {fontOptions.map(font => (
                                      <SelectItem 
                                        key={font.value} 
                                        value={font.value}
                                        style={{ fontFamily: font.value }}
                                      >
                                        {font.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The main font used throughout your store
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                        
                        <CardFooter className="flex justify-between">
                          <Button 
                            variant="outline" 
                            type="button"
                            onClick={() => form.reset()}
                            disabled={updateThemeMutation.isPending}
                          >
                            Reset
                          </Button>
                          <Button 
                            type="submit"
                            disabled={updateThemeMutation.isPending}
                          >
                            {updateThemeMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>See how your changes look</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-6">
                        <div 
                          className="p-4 rounded-md"
                          style={{ 
                            fontFamily: previewStyle.fontFamily,
                            background: 'white',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <h3 className="text-lg font-semibold" style={{ color: previewStyle.primaryColor }}>
                            Store Name
                          </h3>
                          <p className="mt-2 text-sm text-gray-600">
                            This is how your store description will appear to visitors.
                          </p>
                          <div className="mt-4 space-y-2">
                            <button 
                              className="px-4 py-2 rounded-md text-white text-sm"
                              style={{ backgroundColor: previewStyle.primaryColor }}
                            >
                              Primary Button
                            </button>
                            <button 
                              className="px-4 py-2 rounded-md text-white text-sm block"
                              style={{ backgroundColor: previewStyle.secondaryColor }}
                            >
                              Secondary Button
                            </button>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              Click <a href="#" style={{ color: previewStyle.primaryColor }}>this link</a> to learn more.
                            </p>
                          </div>
                          <div 
                            className="mt-4 p-2 rounded-md"
                            style={{ backgroundColor: `${previewStyle.primaryColor}10` }}
                          >
                            <p className="text-sm" style={{ color: previewStyle.primaryColor }}>
                              This is a highlighted information box.
                            </p>
                          </div>
                          <div className="mt-4 text-sm text-gray-500">
                            Footer text and additional information
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Theme Templates</CardTitle>
                  <CardDescription>Choose from pre-designed theme templates</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                      className="border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-primary-500 transition-colors"
                      onClick={() => {
                        form.setValue('primaryColor', '#4F46E5');
                        form.setValue('secondaryColor', '#f97316');
                        form.setValue('fontFamily', 'Inter');
                      }}
                    >
                      <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                      <div className="p-3">
                        <h4 className="text-sm font-medium">Modern</h4>
                        <p className="text-xs text-gray-500">Clean and contemporary design</p>
                      </div>
                    </div>
                    
                    <div 
                      className="border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-primary-500 transition-colors"
                      onClick={() => {
                        form.setValue('primaryColor', '#059669');
                        form.setValue('secondaryColor', '#f59e0b');
                        form.setValue('fontFamily', 'Montserrat');
                      }}
                    >
                      <div className="h-24 bg-gradient-to-r from-green-600 to-teal-600"></div>
                      <div className="p-3">
                        <h4 className="text-sm font-medium">Nature</h4>
                        <p className="text-xs text-gray-500">Eco-friendly and organic feel</p>
                      </div>
                    </div>
                    
                    <div 
                      className="border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-primary-500 transition-colors"
                      onClick={() => {
                        form.setValue('primaryColor', '#db2777');
                        form.setValue('secondaryColor', '#6366f1');
                        form.setValue('fontFamily', 'Poppins');
                      }}
                    >
                      <div className="h-24 bg-gradient-to-r from-pink-600 to-rose-600"></div>
                      <div className="p-3">
                        <h4 className="text-sm font-medium">Vibrant</h4>
                        <p className="text-xs text-gray-500">Bold and energetic design</p>
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

export default ThemeSettings;
