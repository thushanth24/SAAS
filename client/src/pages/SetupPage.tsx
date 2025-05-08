import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define form schema
const setupSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(20, "Subdomain must be less than 20 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SetupFormData = z.infer<typeof setupSchema>;

const SetupPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState('');

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      storeName: '',
      subdomain: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/register', data);
      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Initiated",
          description: "Please check your phone for the OTP code.",
        });
        setOtpSent(true);
        setUserId(result.userId);
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!userId || !otp) return;

    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/verify-otp', {
        email: form.getValues('email'),
        phone: form.getValues('phone'),
        otp,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Setup Complete",
          description: "Your store has been created successfully!",
        });
        setLocation('/dashboard');
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Helmet>
        <title>Setup Your Store | ShopEase</title>
        <meta name="description" content="Create your online store in minutes with ShopEase." />
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Store</CardTitle>
          <CardDescription>
            Get started with your own online store in minutes
          </CardDescription>
        </CardHeader>

        {otpSent ? (
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">
                We've sent a one-time password to your phone number.
              </p>
              <p className="text-sm text-gray-600">
                Please enter it below to verify your account.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={verifyOtp}
              disabled={isLoading || !otp}
            >
              {isLoading ? "Verifying..." : "Verify & Complete Setup"}
            </Button>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Store Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Subdomain</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input placeholder="your-store" {...field} />
                          <span className="ml-2 text-gray-500 text-sm">.shopease.com</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        This will be your store's unique URL
                      </FormDescription>
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
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll send a verification code to this number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Store"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default SetupPage;