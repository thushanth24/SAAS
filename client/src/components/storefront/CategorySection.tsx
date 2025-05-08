import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
  image: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="relative rounded-lg overflow-hidden">
      <img 
        src={category.image || "https://via.placeholder.com/800x600?text=Category"} 
        alt={category.name} 
        className="w-full h-80 object-cover" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">{category.name}</h3>
          <Button
            asChild 
            variant="secondary"
            className="mt-4 bg-white text-gray-900 py-2 px-5 rounded-md hover:bg-gray-100 transition duration-200"
          >
            <Link href={`/categories/${category.id}`}>
              View Collection
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  categories: Category[];
  isLoading: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Shop by Category</h2>
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
