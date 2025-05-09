import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useStore } from '@/hooks/use-store';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials, getGravatarUrl } from '@/lib/utils';
import { Helmet } from 'react-helmet';
// Function to fetch customers
const fetchCustomers = async (storeId: number) => {
  const response = await apiRequest('GET', `/api/stores/${storeId}/customers`);
  return response.json();
};
// Function to fetch customer orders
const fetchCustomerOrders = async (customerId: number) => {
  const response = await apiRequest('GET', `/api/customers/${customerId}/orders`);
  return response.json();
};
const Customers: React.FC = () => {
  const { currentStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerDetailDialogOpen, setCustomerDetailDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  // Fetch customers - using proper queryFn
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', currentStore?.id],
    queryFn: () => currentStore?.id ? fetchCustomers(currentStore.id) : Promise.resolve([]),
    enabled: !!currentStore?.id,
  });

  // In your Customers.tsx file, add this code right after where you define customers:

// Filter customers based on search query
const filteredCustomers = customers ? customers.filter(customer => 
  !searchQuery ||
  customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  customer.phone?.includes(searchQuery)
) : [];
  
  // Fetch customer orders - using proper queryFn
  const { data: customerOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['customerOrders', selectedCustomer?.id],
    queryFn: () => selectedCustomer?.id ? fetchCustomerOrders(selectedCustomer.id) : Promise.resolve([]),
    enabled: !!selectedCustomer?.id,
  });
  
  if (!currentStore) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Please select a store to continue</p>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Customers | ShopEase</title>
        <meta name="description" content="Manage your customer relationships and view purchase history." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Customers" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>View and manage your store customers</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                  </div>
                ) : filteredCustomers.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={getGravatarUrl(customer.email)} alt={customer.name} />
                                  <AvatarFallback>{getInitials(customer.name || 'User')}</AvatarFallback>
                                </Avatar>
                                {customer.name || 'Guest'}
                              </div>
                            </TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone || '-'}</TableCell>
                            <TableCell>{formatDate(customer.createdAt)}</TableCell>
                            <TableCell>{customer.orderCount || 0}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => viewCustomerDetails(customer)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    {searchQuery ? (
                      <div>
                        <p className="text-lg font-medium text-gray-900">No customers found</p>
                        <p className="text-sm text-gray-500">Try a different search term</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900">No customers yet</p>
                        <p className="text-sm text-gray-500">Customers will appear here when they make purchases</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              {filteredCustomers.length > 0 && (
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {filteredCustomers.length} of {customers?.length || 0} customers
                  </p>
                </CardFooter>
              )}
            </Card>
          </main>
        </div>
      </div>
      
      {/* Customer Details Dialog */}
      <Dialog open={customerDetailDialogOpen} onOpenChange={setCustomerDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View customer information and order history
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={getGravatarUrl(selectedCustomer.email, 160)} alt={selectedCustomer.name} />
                  <AvatarFallback className="text-lg">{getInitials(selectedCustomer.name || 'User')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{selectedCustomer.name || 'Guest'}</h3>
                  <p className="text-gray-500">Customer since {formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {selectedCustomer.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Statistics</h4>
                  <p className="text-sm"><span className="font-medium">Total Orders:</span> {selectedCustomer.orderCount || 0}</p>
                  <p className="text-sm"><span className="font-medium">Total Spent:</span> ${selectedCustomer.totalSpent || '0.00'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order History</h4>
                {ordersLoading ? (
                  <div className="py-4 flex justify-center">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                  </div>
                ) : customerOrders && customerOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.toString().padStart(4, '0')}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray-500 py-4">No orders yet from this customer</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDetailDialogOpen(false)}>
              Close
            </Button>
            <Button disabled={!selectedCustomer?.email}>
              Email Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Customers;
