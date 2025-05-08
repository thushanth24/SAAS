import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: {
    id: number;
    name: string;
  };
  inventory: number;
  featured: boolean;
}

interface ProductsGridProps {
  products: Product[];
  title: string;
  isLoading: boolean;
  onAddProduct?: () => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  title, 
  isLoading, 
  onAddProduct 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {onAddProduct && (
            <Button onClick={onAddProduct}>
              Add New Product
            </Button>
          )}
        </div>
        <div className="p-6 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {onAddProduct && (
          <Button onClick={onAddProduct}>
            Add New Product
          </Button>
        )}
      </div>
      
      {products.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6">Start adding products to your store</p>
          {onAddProduct && (
            <Button onClick={onAddProduct}>
              Add Your First Product
            </Button>
          )}
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="relative h-48">
                <img 
                  src={product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {product.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-secondary-400 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="destructive">
                      Sale
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="text-gray-900 font-medium">{product.name}</h3>
                {product.category && (
                  <p className="text-gray-500 text-sm mt-1">{product.category.name}</p>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <span className="text-primary-600 font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-gray-400 text-sm line-through ml-2">
                        {formatCurrency(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">Stock: {product.inventory}</span>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full mr-2"
                  >
                    <Link href={`/products/${product.id}`}>
                      <span>Edit</span>
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <Link href={`/products/${product.id}/preview`}>
                      <span>Preview</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {products.length > 0 && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing recent products</p>
          {products.length > 3 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">
                <span>View All Products</span>
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
