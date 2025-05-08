import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

interface Product {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  rating?: {
    average: number;
    count: number;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <a>
            <img 
              src={product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"} 
              alt={product.name} 
              className="w-full h-64 object-cover" 
            />
          </a>
        </Link>
        <div className="absolute top-2 right-2">
          <button 
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition duration-200"
            aria-label="Add to wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            SALE
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <a>
            <h3 className="text-gray-900 font-medium hover:text-primary-600 transition-colors">{product.name}</h3>
          </a>
        </Link>
        
        {product.rating && (
          <div className="mt-1 flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  viewBox="0 0 20 20" 
                  fill={i < Math.floor(product.rating.average) ? "currentColor" : "none"}
                  stroke="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-500 text-xs ml-2">({product.rating.count})</span>
          </div>
        )}
        
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-primary-600 font-semibold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-gray-400 text-sm line-through ml-2">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="bg-primary-600 text-white hover:bg-primary-700 transition duration-200"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  isLoading: boolean;
  viewAllLink?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  products, 
  title = "Featured Products", 
  isLoading,
  viewAllLink = "/shop" 
}) => {
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      quantity: 1
    });
  };
  
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{title}</h2>
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <Link href={viewAllLink}>
            <a className="text-primary-600 hover:text-primary-700 flex items-center">
              View All 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
