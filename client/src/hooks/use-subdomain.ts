import { useEffect, useState } from "react";

/**
 * A hook to parse and manage subdomain information from the current URL.
 * Useful for multi-tenant applications where each tenant has their own subdomain.
 */
export default function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const extractSubdomain = () => {
      try {
        // First try to get subdomain from URL parameters (useful for development)
        try {
          const urlParams = new URLSearchParams(window.location.search || "");
          const querySubdomain = urlParams.get('subdomain');
          if (querySubdomain) {
            return querySubdomain;
          }
        } catch (paramError) {
          console.error('Error checking URL parameters:', paramError);
        }
        
        // Then try to extract from hostname
        const hostname = window.location.hostname || "";
        
        // Check if it's an IP address
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
          return null;
        }
        
        // Handle localhost special case
        if (hostname === 'localhost' || hostname.startsWith('localhost:')) {
          return null;
        }
        
        // Extract subdomain from hostname
        const parts = hostname.split('.');
        if (parts.length > 2) {
          return parts[0];
        }
        
        return null;
      } catch (error) {
        console.error('Error extracting subdomain:', error);
        return null;
      }
    };
    
    const parsedSubdomain = extractSubdomain();
    setSubdomain(parsedSubdomain);
    setIsLoading(false);
  }, []);

  return {
    subdomain,
    isLoading,
    isStorefront: !!subdomain,
  };
}
