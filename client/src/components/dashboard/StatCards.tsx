import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, onClick }) => {
  return (
    <Card className="hover:shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="bg-primary-100 p-3 rounded-full">
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
        </div>
        {trend && (
          <div className={`mt-4 flex items-center text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StatCardsProps {
  stats: {
    orders: number;
    revenue: number;
    customers: number;
    products: number;
  };
  onViewAllProducts?: () => void;
}

const StatCards: React.FC<StatCardsProps> = ({ stats, onViewAllProducts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 h-6 w-6">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        }
        title="Total Orders"
        value={stats.orders}
        trend={{ value: "12% from last month", positive: true }}
      />
      
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 h-6 w-6">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        title="Total Revenue"
        value={formatCurrency(stats.revenue)}
        trend={{ value: "18% from last month", positive: true }}
      />
      
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 h-6 w-6">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        title="Total Customers"
        value={stats.customers}
        trend={{ value: "9% from last month", positive: true }}
      />
      
      <StatCard
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 h-6 w-6">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        }
        title="Total Products"
        value={stats.products}
        onClick={onViewAllProducts}
      />
    </div>
  );
};

export default StatCards;
