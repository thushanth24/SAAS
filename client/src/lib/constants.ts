// For Create React App
export const APP_DOMAIN = process.env.REACT_APP_DOMAIN || 'axzellin.com';

// OR for Vite
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 'axzellin.com';

// Helper for constructing URLs
export const getStoreUrl = (subdomain: string) => {
  return `https://${subdomain}.${APP_DOMAIN}`;
};

// For local development testing with query parameters
export const getLocalStoreUrl = (subdomain: string) => {
  return `${window.location.origin}?subdomain=${subdomain}`;
};