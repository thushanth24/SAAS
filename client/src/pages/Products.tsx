import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useStore } from '@/hooks/use-store';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';



interface ProductType {
  id: number;
  name: string;
  description?: string | null;
  price: string;
  images?: string;
  inventory:string;
  active:string;
  // Add other properties your product has
}

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  compareAtPrice: z.string().optional(),
  sku: z.string().optional(),
  inventory: z.coerce.number().int().min(0, "Inventory must be 0 or greater"),
  images: z.array(z.string()).optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

// Create a custom fetch function for the queries
const fetchProducts = async (storeId: number) => {
  console.log(`Fetching products for store ${storeId}`);
  const response = await apiRequest('GET', `/api/stores/${storeId}/products`);
  const data = await response.json();
  console.log('Products fetched:', data);
  return data;
};

// Function to create a test product
const createTestProduct = async (storeId: number) => {
  const testProduct = {
    name: `Test Product ${Date.now()}`,
    description: 'This is a test product description',
    price: '29.99',
    compareAtPrice: '39.99',
    sku: `TP-${Date.now()}`,
    inventory: 100,
    images: ['https://via.placeholder.com/600x400'],
    featured: true,
    active: true
  };
  
  console.log(`Creating test product for store ${storeId}:`, testProduct);
  const response = await apiRequest('POST', `/api/stores/${storeId}/products`, {
    ...testProduct,
    storeId
  });
  
  const data = await response.json();
  console.log('Test product created:', data);
  return data;
};

const Products: React.FC = () => {
  const [location, navigate] = useLocation();
  const { currentStore } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Product form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      sku: '',
      inventory: 0,
      images: [],
      active: true,
      featured: false,
    },
  });
  
  // Fetch products - using the proper query function with added logging
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', currentStore?.id],
    queryFn: () => {
      if (!currentStore?.id) {
        console.log('No store ID, returning empty array');
        return Promise.resolve([]);
      }
      return fetchProducts(currentStore.id);
    },
    enabled: !!currentStore?.id,
  });
  
  console.log('Products array:', products);
  
  // Create test product mutation
  const createTestMutation = useMutation({
    mutationFn: () => {
      if (!currentStore?.id) {
        console.log('No store ID for test product');
        return Promise.resolve(null);
      }
      return createTestProduct(currentStore.id);
    },
    onSuccess: (data) => {
      console.log('Test product creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['products', currentStore?.id] });
      // Force an immediate refetch
      queryClient.refetchQueries({ queryKey: ['products', currentStore?.id] });
      toast({
        title: "Test product created",
        description: "A new test product has been added to your store",
      });
    },
    onError: (error) => {
      console.error('Error creating test product:', error);
      toast({
        variant: "destructive",
        title: "Failed to create test product",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Create product mutation with improved error handling and logging
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      console.log('Creating product with data:', data);
      
      // Transform the data as needed for the API
      const apiData = {
        ...data,
        price: data.price, // Keep as string for API
        compareAtPrice: data.compareAtPrice || null,
        storeId: currentStore?.id
      };
      
      console.log('Sending to API:', apiData);
      const response = await apiRequest('POST', `/api/stores/${currentStore?.id}/products`, apiData);
      
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Product created:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log('Product creation successful:', data);
      // Explicitly refetch the products
      queryClient.invalidateQueries({ queryKey: ['products', currentStore?.id] });
      // Force an immediate refetch
      queryClient.refetchQueries({ queryKey: ['products', currentStore?.id] });
      
      toast({
        title: "Product created",
        description: "The product has been successfully created",
      });
      setProductDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        variant: "destructive",
        title: "Failed to create product",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ProductFormData }) => {
      console.log(`Updating product ${id} with data:`, data);
      const response = await apiRequest('PATCH', `/api/products/${id}`, data);
      
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Product updated:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log('Product update successful:', data);
      queryClient.invalidateQueries({ queryKey: ['products', currentStore?.id] });
      queryClient.refetchQueries({ queryKey: ['products', currentStore?.id] });
      
      toast({
        title: "Product updated",
        description: "The product has been successfully updated",
      });
      setProductDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        variant: "destructive",
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      console.log(`Deleting product ${productId}`);
      return apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      console.log('Product deletion successful');
      queryClient.invalidateQueries({ queryKey: ['products', currentStore?.id] });
      queryClient.refetchQueries({ queryKey: ['products', currentStore?.id] });
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Filter products based on search query
  const filteredProducts = searchQuery && products
  ? products.filter((product: ProductType) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : products;
  
  console.log('Filtered products:', filteredProducts);
  
  const openAddProductDialog = () => {
    console.log('Opening add product dialog');
    form.reset({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      sku: '',
      inventory: 0,
      images: [],
      active: true,
      featured: false,
    });
    setEditingProduct(null);
    setProductDialogOpen(true);
  };
  
  const openEditProductDialog = (product: any) => {
    console.log('Opening edit product dialog for product:', product);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice?.toString() || '',
      sku: product.sku || '',
      inventory: product.inventory || 0,
      images: product.images || [],
      active: product.active !== false,
      featured: product.featured === true,
    });
    setEditingProduct(product);
    setProductDialogOpen(true);
  };
  
  const confirmDelete = (productId: number) => {
    console.log(`Confirming deletion of product ${productId}`);
    setDeleteProductId(productId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteProduct = () => {
    if (deleteProductId) {
      console.log(`Deleting product ${deleteProductId}`);
      deleteProductMutation.mutate(deleteProductId);
    }
  };
  
  const onSubmit = (data: ProductFormData) => {
    console.log('Form submitted with data:', data);
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
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
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => createTestMutation.mutate()}
                    disabled={createTestMutation.isPending}
                  >
                    {createTestMutation.isPending ? "Creating..." : "Create Test Product"}
                  </Button>
                  <Button onClick={openAddProductDialog}>
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
                </div>
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
                      {filteredProducts.map((product: ProductType) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                                  <img 
                                    src={product.images && product.images[0] ? product.images[0] : "https://via.placeholder.com/40"} 
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                {product.name}
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(parseFloat(product.price))}</TableCell>
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
                                onClick={() => openEditProductDialog(product)}
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
                        <Button onClick={openAddProductDialog}>Add Product</Button>
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
      
      {/* Delete Dialog */}
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
      
      {/* Product Form Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Create a new product for your store'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Premium T-Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product (optional)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 29.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare At Price</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 39.99 (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TSH-001 (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setProductDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {createProductMutation.isPending || updateProductMutation.isPending
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update Product'
                    : 'Add Product'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;