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

const Dashboard: React.FC = () => {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentStore } = useStore();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Stats data query
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stores', currentStore?.id, 'stats'],
    enabled: !!currentStore?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Recent orders query
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/stores', currentStore?.id, 'orders'],
    enabled: !!currentStore?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Recent products query
  const { data: recentProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/stores', currentStore?.id, 'products'],
    enabled: !!currentStore?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mock data for initial development
  const stats = statsData || {
    orders: 125,
    revenue: 8459,
    customers: 243,
    products: 56,
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
  
  if (!isAuthenticated) {
    return null;
  }
  
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
