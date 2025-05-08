import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useStore } from '@/hooks/use-store';
import { useTenant } from '@/hooks/use-tenant';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { Product } from '@shared/schema';

const StorefrontPage: React.FC = () => {
  const { tenant } = useTenant();
  const { storefrontData, isLoading: storeLoading } = useStore();
  const { addItem } = useCart();
  
  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/stores/${tenant?.storeId}/products/featured`],
    enabled: !!tenant?.storeId,
  });
  
  const isLoading = storeLoading || productsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!storefrontData || !tenant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Store Not Found</h2>
            <p className="text-gray-600 mb-8">The store you're looking for doesn't exist or is no longer available.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const { store, categories } = storefrontData;
  
  // Add product to cart handler
  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder-product.png',
      quantity: 1,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{store.name}</title>
        <meta name="description" content={store.description || `Welcome to ${store.name} - Shop our products online.`} />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-8 mb-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">{store.name}</h1>
            <p className="text-lg mb-6">{store.description || `Welcome to ${store.name}. Discover our quality products at great prices.`}</p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                asChild
              >
                <Link href="/products">Shop Now</Link>
              </Button>
              {categories && categories.length > 0 && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  asChild
                >
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => (
                <Link key={category.id} href={`/categories/${category.id}`}>
                  <a className="block group">
                    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-2 relative">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-2xl">{category.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">View</span>
                      </div>
                    </div>
                    <h3 className="font-medium text-center">{category.name}</h3>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Featured Products Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: Product) => (
                <Card key={product.id} className="overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-2xl">{product.name.charAt(0)}</span>
                      </div>
                    )}
                    {product.discountPercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {product.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <Link href={`/products/${product.id}`}>
                      <a>
                        <CardTitle className="text-lg hover:text-primary transition-colors">{product.name}</CardTitle>
                      </a>
                    </Link>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex flex-col items-start">
                    <div className="mb-3">
                      {product.discountPercentage > 0 ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}</span>
                          <span className="text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex space-x-2 w-full">
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="flex-grow"
                        variant="outline"
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        asChild
                        variant="default"
                      >
                        <Link href={`/products/${product.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No featured products found.</p>
              <Button 
                variant="link"
                asChild
                className="mt-2"
              >
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default StorefrontPage;