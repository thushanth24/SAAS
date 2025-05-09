import React, { useState } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet';

interface CategoryType {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  productCount?: number;
}
// Form validation schema
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
});
type CategoryFormData = z.infer<typeof categorySchema>;
// Function to fetch categories
const fetchCategories = async (storeId: number) => {
  const response = await apiRequest('GET', `/api/stores/${storeId}/categories`);
  return response.json();
};
const Categories: React.FC = () => {
  const { currentStore } = useStore();
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  
  // Category form
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
    },
  });

  
  
  // Fetch categories - using proper queryFn
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', currentStore?.id],
    queryFn: () => currentStore?.id ? fetchCategories(currentStore.id) : Promise.resolve([]),
    enabled: !!currentStore?.id,
  });
  
  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return apiRequest('POST', `/api/stores/${currentStore?.id}/categories`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentStore?.id] });
      toast({
        title: "Category created",
        description: "The category has been successfully created",
      });
      setCategoryDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create category",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: CategoryFormData }) => {
      return apiRequest('PATCH', `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentStore?.id] });
      toast({
        title: "Category updated",
        description: "The category has been successfully updated",
      });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update category",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return apiRequest('DELETE', `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentStore?.id] });
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete category",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });
  
  const openAddCategoryDialog = () => {
    form.reset({
      name: '',
      description: '',
      image: '',
    });
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };
  
  const openEditCategoryDialog = (category: any) => {
    form.reset({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
    });
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };
  
  const confirmDeleteCategory = (categoryId: number) => {
    setDeleteCategoryId(categoryId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCategory = () => {
    if (deleteCategoryId) {
      deleteCategoryMutation.mutate(deleteCategoryId);
    }
  };
  
  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
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
        <title>Categories | ShopEase</title>
        <meta name="description" content="Manage product categories for your online store." />
      </Helmet>

      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Categories" />
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Organize your products with categories</CardDescription>
                </div>
                <Button onClick={openAddCategoryDialog}>
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
                  Add Category
                </Button>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category:CategoryType) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                {category.image && (
                                  <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                                    <img 
                                      src={category.image} 
                                      alt={category.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                {category.name}
                              </div>
                            </TableCell>
                            <TableCell>{category.description || "-"}</TableCell>
                            <TableCell>{category.productCount || 0}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openEditCategoryDialog(category)}
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => confirmDeleteCategory(category.id)}
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
                    <p className="text-lg font-medium text-gray-900">No categories yet</p>
                    <p className="text-sm text-gray-500 mb-4">Add your first category to organize your products</p>
                    <Button onClick={openAddCategoryDialog}>Add Category</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* Category Form Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Create a new category to organize your products'}
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
                      <Input placeholder="e.g. Electronics" {...field} />
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
                        placeholder="Describe your category (optional)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the category image (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending
                    ? "Saving..."
                    : editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
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
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Categories;
