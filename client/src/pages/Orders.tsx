import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useStore } from '@/hooks/use-store';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
// Function to fetch orders
const fetchOrders = async (storeId: number) => {
  const response = await apiRequest('GET', `/api/stores/${storeId}/orders`);
  return response.json();
};
// Function to fetch customer orders
const fetchCustomerOrders = async (customerId: number) => {
  const response = await apiRequest('GET', `/api/customers/${customerId}/orders`);
  return response.json();
};
const Orders: React.FC = () => {
  const { currentStore } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Fetch orders - using proper queryFn
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', currentStore?.id],
    queryFn: () => currentStore?.id ? fetchOrders(currentStore.id) : Promise.resolve([]),
    enabled: !!currentStore?.id,
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      return apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', currentStore?.id] });
      toast({
        title: "Order status updated",
        description: "The order status has been successfully updated",
      });
      setUpdatingStatus(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update order status",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      setUpdatingStatus(false);
    },
  });
  
  // Filter orders based on search query and status filter
  const filteredOrders = orders ? orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.id.toString().includes(searchQuery) || 
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
      const matchesStatus = !statusFilter || statusFilter === "all" || order.status === statusFilter;    
    return matchesSearch && matchesStatus;
  }) : [];
  
  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailDialogOpen(true);
  };
  
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };
  
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
        <title>Orders | ShopEase</title>
        <meta name="description" content="Manage customer orders, track shipments, and process fulfillments." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Orders" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="w-[200px]">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id.toString().padStart(4, '0')}</TableCell>
                            <TableCell>{order.customer?.name || 'Guest'}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"} variant="outline">
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => viewOrderDetails(order)}
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
                    {searchQuery || statusFilter ? (
                      <div>
                        <p className="text-lg font-medium text-gray-900">No orders found</p>
                        <p className="text-sm text-gray-500">Try a different search term or filter</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900">No orders yet</p>
                        <p className="text-sm text-gray-500">Orders will appear here when customers make purchases</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              {filteredOrders.length > 0 && (
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {filteredOrders.length} of {orders?.length || 0} orders
                  </p>
                </CardFooter>
              )}
            </Card>
          </main>
        </div>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.toString().padStart(4, '0')}</DialogTitle>
            <DialogDescription>
              {formatDate(selectedOrder?.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                  <div className="mt-2 text-sm text-gray-900">
                    <p>{selectedOrder.customer?.name || 'Guest'}</p>
                    <p>{selectedOrder.customer?.email}</p>
                    <p>{selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
                  <div className="mt-2 text-sm text-gray-900">
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <Badge className={statusColors[selectedOrder.status] || "bg-gray-100 text-gray-800"} variant="outline">
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                  
                  <Select
                    defaultValue={selectedOrder.status}
                    onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
                <div className="mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {item.product.images?.[0] && (
                                <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                                  <img 
                                    src={item.product.images[0]} 
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              {item.product.name}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-medium">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-base font-medium mt-4">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Payment Method</span>
                  <span className="capitalize">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-medium">Payment ID</span>
                  <span className="text-gray-500">{selectedOrder.paymentId}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailDialogOpen(false)}>
              Close
            </Button>
            <Button>
              Print Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Orders;
