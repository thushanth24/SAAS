import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getInitials, getGravatarUrl } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useStore } from '@/hooks/use-store';

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const { stores, selectStore, currentStore } = useStore();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {stores && stores.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="mr-2">{currentStore?.name || 'Select Store'}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="w-4 h-4"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stores.map(store => (
                  <DropdownMenuItem 
                    key={store.id} 
                    onClick={() => selectStore(store)}
                    className="cursor-pointer"
                  >
                    {store.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <a href="#" className="text-gray-500 hover:text-gray-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </a>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-gray-700 focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.email ? getGravatarUrl(user.email) : undefined} 
                    alt={user?.username || 'User'} 
                  />
                  <AvatarFallback>{user?.username ? getInitials(user.username) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="ml-2">{user?.username || 'User'}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-4 h-4 ml-1 text-xs"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem as="a" href="/store-settings">
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem as="a" href="/payment-settings">
                Billing & Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
