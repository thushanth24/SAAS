import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useStore } from '@/hooks/use-store';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Helmet } from 'react-helmet';

const Products: React.FC = () => {
  const [location, navigate] = useLocation();
  const { currentStore } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/stores', currentStore?.id, 'products'],
    enabled: !!currentStore?.id,
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores', currentStore?.id, 'products'] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Filter products based on search query
  const filteredProducts = searchQuery && products
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;
  
  const confirmDelete = (productId: number) => {
    setDeleteProductId(productId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteProduct = () => {
    if (deleteProductId) {
      deleteProductMutation.mutate(deleteProductId);
    }
  };
  
  const handleAddProduct = () => {
    navigate('/products/new');
  };
  
  const handleEditProduct = (productId: number) => {
    navigate(`/products/${productId}`);
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
        <title>Products | ShopEase</title>
        <meta name="description" content="Manage your store products, add new items, and organize your inventory." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Products" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your store products and inventory</CardDescription>
                </div>
                <Button onClick={handleAddProduct}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Add Product
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                  </div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Inventory</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                                  <img 
                                    src={product.images[0] || "https://via.placeholder.com/40"} 
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                {product.name}
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>{product.inventory}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {product.active ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditProduct(product.id)}
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => confirmDelete(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                Delete
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
                        <p className="text-lg font-medium text-gray-900">No products found</p>
                        <p className="text-sm text-gray-500">Try a different search term</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-900">No products yet</p>
                        <p className="text-sm text-gray-500 mb-4">Add your first product to get started</p>
                        <Button onClick={handleAddProduct}>Add Product</Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              {filteredProducts && filteredProducts.length > 0 && (
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {filteredProducts.length} of {products?.length || 0} products
                  </p>
                </CardFooter>
              )}
            </Card>
          </main>
        </div>
      </div>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;
