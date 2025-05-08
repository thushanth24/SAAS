import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function TestLogin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      // Login with test user email and phone directly
      const response = await apiRequest("POST", "/api/auth/login", {
        email: "test@example.com",
        phone: "1234567890",
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (data.skipOTP && data.user) {
        toast({
          title: "Success",
          description: "Test user logged in successfully!",
        });
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Test user auto-login not working",
        });
      }
    } catch (error) {
      console.error("Test login error:", error);
      setResult(error instanceof Error ? error.message : "Unknown error");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Try to auto-login on page load
  useEffect(() => {
    handleTestLogin();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Test Login</h1>
          <p className="mt-2 text-gray-600">
            This page will automatically attempt to log in with the test user credentials
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-center">
            <Button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Try Login Again"
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-4 overflow-auto rounded-md bg-gray-100 p-4">
              <pre className="text-xs text-gray-800">{result}</pre>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Test User Credentials:</p>
            <ul className="list-disc pl-5 text-left">
              <li>Email: test@example.com</li>
              <li>Phone: 1234567890</li>
              <li>Username: testuser</li>
              <li>Password: password123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}