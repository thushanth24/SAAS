import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import { CartProvider } from "./contexts/CartContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Orders from "@/pages/Orders";
import Customers from "@/pages/Customers";
import StoreSettings from "@/pages/StoreSettings";
import ThemeSettings from "@/pages/ThemeSettings";
import PaymentSettings from "@/pages/PaymentSettings";
import StorefrontPage from "@/pages/StorefrontPage";
import ProductDetail from "@/pages/ProductDetail";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import SetupPage from "@/pages/SetupPage";
import TestLogin from "@/pages/TestLogin";
import useSubdomain from "./hooks/use-subdomain";

function Router() {
  const { subdomain, isStorefront, isLoading } = useSubdomain();
  
  // Special case for certain pages - always accessible regardless of subdomain
  const location = window.location.pathname;
  if (location === '/setup') {
    return <SetupPage />;
  }
  
  // Added test login page for direct access
  if (location === '/test-login') {
    return <TestLogin />;
  }
  
  // Added login page exception - always show dashboard for testing
  if (location === '/dashboard' || location === '/login') {
    return <Dashboard />;
  }

  // Show loading state while determining routing
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Render storefront routes if a subdomain is detected
  if (isStorefront) {
    return (
      <Switch>
        <Route path="/" component={StorefrontPage} />
        <Route path="/products/:productId" component={ProductDetail} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Render main app routes for the primary domain
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/setup" component={SetupPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/categories" component={Categories} />
      <Route path="/orders" component={Orders} />
      <Route path="/customers" component={Customers} />
      <Route path="/store-settings" component={StoreSettings} />
      <Route path="/theme-settings" component={ThemeSettings} />
      <Route path="/payment-settings" component={PaymentSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <Toaster />
              <Router />
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
