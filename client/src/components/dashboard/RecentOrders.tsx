import React from 'react';
import { Link } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Order {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  createdAt: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface RecentOrdersProps {
  orders: Order[];
  isLoading: boolean;
}

const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={statusStyles[status]} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
      </div>
      
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No orders yet. When customers place orders, they will appear here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-900">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {orders.length > 0 && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing recent orders</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders">
                <span>View All Orders</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
