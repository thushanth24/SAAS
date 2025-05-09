import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCards from '@/components/dashboard/StatCards';
import RecentOrders from '@/components/dashboard/RecentOrders';
import ProductsGrid from '@/components/dashboard/ProductsGrid';
import { useAuth } from '@/hooks/use-auth';
import { useStore } from '@/hooks/use-store';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';

// Create a custom fetch function for the queries
const fetchData = async (url: string) => {
  const response = await apiRequest('GET', url);
  return response.json();
};

const Dashboard: React.FC = () => {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentStore } = useStore();
  
  // Temporarily disable redirect for testing
  // useEffect(() => {
  //   if (!authLoading && !isAuthenticated) {
  //     navigate('/');
  //   }
  // }, [isAuthenticated, authLoading, navigate]);
  
  // Recent orders query - using a proper fetchData function
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', currentStore?.id],
    queryFn: () => currentStore?.id ? fetchData(`/api/stores/${currentStore.id}/orders`) : Promise.resolve([]),
    enabled: !!currentStore?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Recent products query - using a proper fetchData function
  const { data: recentProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', currentStore?.id],
    queryFn: () => currentStore?.id ? fetchData(`/api/stores/${currentStore.id}/products`) : Promise.resolve([]),
    enabled: !!currentStore?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Calculate stats from available data or use fallback values
  const stats = {
    orders: recentOrders?.length || 0,
    revenue: Array.isArray(recentOrders) 
      ? recentOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) 
      : 0,
    customers: 0, // We'd need a separate API call for this
    products: recentProducts?.length || 0,
  };
  
  // Navigate to products page
  const handleViewAllProducts = () => {
    navigate('/products');
  };
  
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  // Allow access even if not authenticated for testing
  // if (!isAuthenticated) {
  //   return null;
  // }
  
  return (
    <>
      <Helmet>
        <title>Dashboard | ShopEase</title>
        <meta name="description" content="Manage your e-commerce store, track sales, and view analytics." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Dashboard" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            {/* Welcome banner for first-time users */}
            <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-primary">
              <h2 className="text-xl font-semibold mb-2">Welcome to Your Store Dashboard</h2>
              <p className="text-gray-600 mb-4">
                This is your store management area where you can monitor sales, manage products, and handle orders.
              </p>
              {currentStore && (
                <p className="text-gray-600">
                  <strong>Current Store:</strong> {currentStore.name}
                </p>
              )}
            </div>
          
            <StatCards 
              stats={stats} 
              onViewAllProducts={handleViewAllProducts}
            />
            
            <RecentOrders 
              orders={recentOrders || []} 
              isLoading={ordersLoading}
            />
            
            <ProductsGrid 
              products={recentProducts || []} 
              title="Recent Products" 
              isLoading={productsLoading}
              onAddProduct={() => navigate('/products/new')}
            />
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;