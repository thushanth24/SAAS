import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OTPInput } from "@/components/ui/otp-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

// Form schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeName: z.string().min(3, "Store name must be at least 3 characters"),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register' | 'otp'>(initialView);
  const [activeTab, setActiveTab] = useState<string>(initialView);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      storeName: "",
      subdomain: "",
    },
  });

  // OTP form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setActiveTab(initialView);
      loginForm.reset();
      registerForm.reset();
      otpForm.reset();
    }
  }, [isOpen, initialView]);

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const result = await res.json();
      
      // Check for test user auto-login
      if (result.skipOTP && result.user) {
        toast({
          title: "Success",
          description: "Authentication successful!",
        });
        onClose();
        window.location.href = "/dashboard";
        return;
      }
      
      // Normal OTP flow
      if (result.userId) {
        setUserId(result.userId);
        setUserEmail(data.email);
        setUserPhone(data.phone);
        setView('otp');
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const result = await res.json();
      
      if (result.userId) {
        setUserId(result.userId);
        setUserEmail(data.email);
        setUserPhone(data.phone);
        setView('otp');
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleVerifyOTP = async (data: z.infer<typeof otpSchema>) => {
    try {
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        email: userEmail,
        phone: userPhone,
        otp: data.otp,
      });
      
      const result = await res.json();
      
      if (result.user) {
        toast({
          title: "Success",
          description: "Authentication successful!",
        });
        onClose();
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid or expired OTP",
      });
    }
  };

  const resendOTP = async () => {
    try {
      if (activeTab === 'login') {
        await apiRequest("POST", "/api/auth/login", {
          email: userEmail,
          phone: userPhone,
        });
      } else {
        // For register, we don't want to recreate the account, just resend OTP
        await apiRequest("POST", "/api/auth/resend-otp", {
          email: userEmail,
          phone: userPhone,
        });
      }
      
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your phone",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to resend OTP",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'register');
    setView(value as 'login' | 'register');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === 'otp' ? 'Verify Your Phone Number' : activeTab === 'login' ? 'Sign In' : 'Register'}
          </DialogTitle>
          <DialogDescription>
            {view === 'otp' 
              ? 'Enter the 6-digit code sent to your phone'
              : activeTab === 'login' 
                ? 'Enter your credentials to sign in to your account'
                : 'Create a new store account'
            }
          </DialogDescription>
        </DialogHeader>

        {view !== 'otp' && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+947XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? "Requesting OTP..." : "Request OTP"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
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
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+947XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Store URL</FormLabel>
                        <div className="flex">
                          <FormControl>
                            <Input placeholder="yourstore" {...field} className="rounded-r-none" />
                          </FormControl>
                          <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                            .shopease.com
                          </span>
                        </div>
                        <FormDescription className="text-xs">
                          Choose a unique name for your store URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                    {registerForm.formState.isSubmitting ? "Registering..." : "Register Store"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}

        {view === 'otp' && (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Enter Verification Code</FormLabel>
                    <FormDescription className="text-sm text-gray-500">
                      We've sent a 6-digit code to your phone number
                    </FormDescription>
                    <FormControl>
                      <OTPInput 
                        length={6} 
                        value={field.value}
                        onChange={field.onChange}
                        className="flex justify-center"
                      />
                    </FormControl>
                    <FormDescription className="text-center text-sm text-gray-500">
                      Didn't receive code? {" "}
                      <button 
                        type="button"
                        onClick={resendOTP}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Resend
                      </button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
                {otpForm.formState.isSubmitting ? "Verifying..." : "Verify & Sign In"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
