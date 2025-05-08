import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useCart } from '@/hooks/use-cart';
import { useTenant } from '@/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { Helmet } from 'react-helmet';
import { Product } from '@shared/schema';

const ProductDetail: React.FC = () => {
  const [match, params] = useRoute('/products/:productId');
  const productId = params?.productId;
  const { tenant } = useTenant();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch related products (same category)
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
    queryKey: [`/api/categories/${product?.categoryId}/products`],
    enabled: !!product?.categoryId,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-6">
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or is no longer available.</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder-product.png',
      quantity,
    });
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const discountedPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{product.name}</title>
        <meta name="description" content={product.description || `Buy ${product.name} at great prices.`} />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/">
            <a className="text-gray-500 hover:text-primary text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain aspect-square"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 aspect-square">
                <span className="text-gray-400 text-5xl">{product.name.charAt(0)}</span>
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="mb-4">
              {product.discountPercentage > 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary">${discountedPrice.toFixed(2)}</span>
                  <span className="text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="prose prose-sm mb-6">
              <p>{product.description}</p>
            </div>
            
            {product.inStock ? (
              <>
                <div className="text-green-600 font-medium mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  In Stock
                </div>
                
                <div className="flex items-center mb-6">
                  <span className="mr-3">Quantity:</span>
                  <div className="flex items-center">
                    <button 
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                      type="button"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-12 h-8 border-y border-gray-300 text-center"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-red-600 font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Out of Stock
              </div>
            )}
            
            {/* Additional product details */}
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-2">Product Details</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="text-gray-500">SKU:</span> {product.sku || `PROD-${product.id}`}</li>
                {product.categoryId && (
                  <li><span className="text-gray-500">Category:</span> {product.categoryName || "Uncategorized"}</li>
                )}
                {product.brand && (
                  <li><span className="text-gray-500">Brand:</span> {product.brand}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter((p: Product) => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct: Product) => (
                  <Card key={relatedProduct.id} className="overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {relatedProduct.image ? (
                        <img 
                          src={relatedProduct.image} 
                          alt={relatedProduct.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-2xl">{relatedProduct.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-col flex-grow p-4">
                      <Link href={`/products/${relatedProduct.id}`}>
                        <a className="font-medium mb-2 hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </a>
                      </Link>
                      <p className="text-primary font-bold mt-auto">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;