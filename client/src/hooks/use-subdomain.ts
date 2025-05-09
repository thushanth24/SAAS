import { useEffect, useState } from "react";

/**
 * A hook to parse and manage subdomain information from the current URL.
 * Useful for multi-tenant applications where each tenant has their own subdomain.
 */
export function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const extractSubdomain = (): string | null => {  // Add return type annotation
      try {
        // First try to get subdomain from URL parameters (useful for development)
        try {
          const urlParams = new URLSearchParams(window.location.search || "");
          const querySubdomain = urlParams.get('subdomain');
          if (querySubdomain) {
            console.log('Found subdomain in URL parameter:', querySubdomain);
            return querySubdomain;  // Make sure to return the value
          }
        } catch (paramError) {
          console.error('Error checking URL parameters:', paramError);
        }
        
        // Then try to extract from hostname
        const hostname = window.location.hostname || "";
        
        // Check if it's an IP address
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
          return null;  // Make sure to return null
        }
        
        // Handle localhost special case
        if (hostname === 'localhost' || hostname.startsWith('localhost:')) {
          return null;  // Make sure to return null
        }
        
        // Extract subdomain from hostname
        const parts = hostname.split('.');
        if (parts.length > 2) {
          return parts[0];  // Make sure to return the value
        }
        
        return null;  // Make sure to return null as default
      } catch (error) {
        console.error('Error extracting subdomain:', error);
        return null;  // Make sure to return null on error
      }
    };
    
    const parsedSubdomain = extractSubdomain();
    console.log('useSubdomain - extracted subdomain:', parsedSubdomain);
    setSubdomain(parsedSubdomain);
    setIsLoading(false);
  }, []);

  return {
    subdomain,
    isLoading,
    isStorefront: !!subdomain,
  };
}

export default useSubdomain;  // Add default export if needed