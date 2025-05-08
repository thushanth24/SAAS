import { useEffect, useState } from "react";

/**
 * A hook to manage tenant information based on current hostname.
 * In a multi-tenant application, this hook helps identify which tenant
 * the user is currently interacting with.
 */
export function useTenant() {
  const [tenant, setTenant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Detect subdomain
    let subdomain: string | null = null;
    
    // Check if it's an IP address
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      subdomain = null;
    }
    // Handle localhost special case
    else if (hostname === 'localhost') {
      subdomain = null;
    }
    // Extract subdomain
    else {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }
    
    setTenant(subdomain);
    setIsLoading(false);
  }, []);

  return {
    tenant,
    isLoading,
    isTenantStore: !!tenant,
  };
}
