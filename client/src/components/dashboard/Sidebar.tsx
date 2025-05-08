import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/use-store';

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, children, active }) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition-colors",
        active ? "bg-sidebar-accent text-white" : "text-sidebar-foreground opacity-80"
      )}>
        {icon}
        <span className="ml-3">{children}</span>
      </a>
    </Link>
  );
};

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <>
      <div className="px-4 py-2 text-xs text-sidebar-foreground opacity-60 uppercase tracking-wider">
        {title}
      </div>
      {children}
    </>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { currentStore } = useStore();
  
  return (
    <div className="w-64 bg-sidebar h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center">
          <span className="text-xl font-bold text-white">ShopEase</span>
        </div>
        {currentStore && (
          <div className="mt-2 text-sm text-sidebar-foreground opacity-80 truncate">
            Store: {currentStore.name}
          </div>
        )}
      </div>
      
      <nav className="mt-6 flex-1 overflow-y-auto">
        <SidebarSection title="Main">
          <SidebarLink 
            href="/dashboard" 
            active={location === '/dashboard'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>}
          >
            Dashboard
          </SidebarLink>
          
          <SidebarLink 
            href="/products" 
            active={location === '/products'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>}
          >
            Products
          </SidebarLink>
          
          <SidebarLink 
            href="/categories" 
            active={location === '/categories'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>}
          >
            Categories
          </SidebarLink>
          
          <SidebarLink 
            href="/orders" 
            active={location === '/orders'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>}
          >
            Orders
          </SidebarLink>
          
          <SidebarLink 
            href="/customers" 
            active={location === '/customers'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>}
          >
            Customers
          </SidebarLink>
        </SidebarSection>
        
        <SidebarSection title="Settings">
          <SidebarLink 
            href="/store-settings" 
            active={location === '/store-settings'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>}
          >
            Store Settings
          </SidebarLink>
          
          <SidebarLink 
            href="/theme-settings" 
            active={location === '/theme-settings'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>}
          >
            Theme
          </SidebarLink>
          
          <SidebarLink 
            href="/payment-settings" 
            active={location === '/payment-settings'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>}
          >
            Payments
          </SidebarLink>
        </SidebarSection>
        
        <div className="px-6 py-4 mt-auto">
          <Link href="/">
            <a className="flex items-center px-4 py-2 text-sidebar-foreground opacity-80 hover:opacity-100 rounded-md transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Back to Home
            </a>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
