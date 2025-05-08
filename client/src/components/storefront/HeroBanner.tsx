import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaLink
}) => {
  return (
    <div className="relative">
      <img 
        src={backgroundImage} 
        alt="Collection banner" 
        className="w-full h-96 object-cover" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-white leading-tight">{title}</h1>
            <p className="mt-4 text-xl text-white">{subtitle}</p>
            <Button 
              asChild
              className="mt-8 bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition duration-200"
              size="lg"
            >
              <Link href={ctaLink}>
                {ctaText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
