import React from 'react';
import { Link } from 'wouter';
import { Facebook, Instagram, Twitter } from 'lucide-react';

interface StorefrontFooterProps {
  storeName?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ 
  storeName = 'Shop',
  socials = {} 
}) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 pt-12 pb-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Store info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{storeName}</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              Quality products at affordable prices. Shop with confidence and enjoy our
              easy returns policy.
            </p>
            <div className="flex space-x-4">
              {socials.facebook && (
                <a 
                  href={socials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socials.instagram && (
                <a 
                  href={socials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socials.twitter && (
                <a 
                  href={socials.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">All Products</a>
                </Link>
              </li>
              <li>
                <Link href="/categories">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">Categories</a>
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">New Arrivals</a>
                </Link>
              </li>
              <li>
                <Link href="/sale">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">Sale</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Information</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">Shipping & Returns</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-600 hover:text-primary-600 text-sm">Terms & Conditions</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} {storeName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Powered by ShopEase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;