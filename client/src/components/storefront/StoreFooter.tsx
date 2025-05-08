import React from 'react';
import { Link } from 'wouter';
import { useStore } from '@/hooks/use-store';

const StoreFooter: React.FC = () => {
  const { currentStore } = useStore();

  if (!currentStore) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {currentStore.name}
            </h3>
            <p className="text-gray-400">
              {currentStore.description || 'Your one-stop destination for quality products.'}
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/shop"><a className="text-gray-400 hover:text-white">All Products</a></Link></li>
              <li><Link href="/categories"><a className="text-gray-400 hover:text-white">Categories</a></Link></li>
              <li><Link href="/shop?featured=true"><a className="text-gray-400 hover:text-white">Featured Items</a></Link></li>
              <li><Link href="/shop?sale=true"><a className="text-gray-400 hover:text-white">Sale</a></Link></li>
              <li><Link href="/shop?new=true"><a className="text-gray-400 hover:text-white">New Arrivals</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/contact"><a className="text-gray-400 hover:text-white">Contact Us</a></Link></li>
              <li><Link href="/shipping"><a className="text-gray-400 hover:text-white">Shipping & Returns</a></Link></li>
              <li><Link href="/faq"><a className="text-gray-400 hover:text-white">FAQ</a></Link></li>
              <li><Link href="/size-guide"><a className="text-gray-400 hover:text-white">Size Guide</a></Link></li>
              <li><Link href="/track-order"><a className="text-gray-400 hover:text-white">Track Order</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>123 Commerce Street, Business City</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>+1 234 567 8901</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>info@{currentStore.subdomain}.shopease.com</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Mon-Fri: 9AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>© {currentYear} {currentStore.name}. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="mr-4">We Accept:</span>
            <div className="flex space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="none" className="h-8 w-auto">
                <rect width="36" height="24" rx="4" fill="#2566AF"/>
                <path d="M15.4 15.0001H13.4L14.6 9.00012H16.6L15.4 15.0001Z" fill="white"/>
                <path d="M22.2 9.20012C21.8 9.10012 21.2 9.00012 20.6 9.00012C18.8 9.00012 17.6 9.80012 17.6 11.0001C17.6 11.9001 18.5 12.4001 19.1 12.7001C19.8 13.0001 20 13.2001 20 13.5001C20 13.9001 19.5 14.1001 19 14.1001C18.3 14.1001 17.9 14.0001 17.3 13.8001L17.1 13.7001L16.9 15.4001C17.4 15.6001 18.2 15.7001 19 15.7001C20.9 15.7001 22.1 14.9001 22.1 13.6001C22.1 12.9001 21.7 12.4001 20.7 12.0001C20.1 11.7001 19.7 11.5001 19.7 11.2001C19.7 10.9001 20 10.7001 20.6 10.7001C21.1 10.7001 21.5 10.8001 21.8 10.9001L22 11.0001L22.2 9.20012Z" fill="white"/>
                <path d="M24.9 9.00012H26.5L25 15.0001H23.4L24.9 9.00012Z" fill="white"/>
                <path d="M11.2 9.00012L9.3 13.1001L9.1 12.2001C8.7 11.0001 7.7 9.80012 6.5 9.20012L8.3 15.0001H10.3L13.3 9.00012H11.2Z" fill="white"/>
                <path d="M8 9.00012H5L4.9 9.20012C7.3 9.80012 9 11.5001 9.6 13.6001L9 9.30012C8.9 9.10012 8.5 9.00012 8 9.00012Z" fill="#FAA61A"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="none" className="h-8 w-auto">
                <rect width="36" height="24" rx="4" fill="#231F20"/>
                <path d="M14.5 7.5C11.5 7.5 9 9.9 9 13C9 16.1 11.4 18.5 14.5 18.5C17.6 18.5 20 16.1 20 13C20 9.9 17.5 7.5 14.5 7.5Z" fill="#CC0000"/>
                <path d="M14.5 7.5C12.3 7.5 10.3 8.7 9.5 10.5C10.2 12.5 12.2 14 14.5 14C16.8 14 18.8 12.5 19.5 10.5C18.7 8.7 16.7 7.5 14.5 7.5Z" fill="#FFB600"/>
                <path d="M27 7.5C24 7.5 21.5 9.9 21.5 13C21.5 16.1 23.9 18.5 27 18.5C30.1 18.5 32.5 16.1 32.5 13C32.5 9.9 30 7.5 27 7.5Z" fill="#CC0000"/>
                <path d="M27 7.5C24.8 7.5 22.8 8.7 22 10.5C22.7 12.5 24.7 14 27 14C29.3 14 31.3 12.5 32 10.5C31.2 8.7 29.2 7.5 27 7.5Z" fill="#FFB600"/>
                <path d="M21 13L20 14H21.5L22 13L21.5 12H20L21 13Z" fill="#FFF"/>
                <path d="M22 11H23.5L24 10H22.5L22 11Z" fill="#FFF"/>
                <path d="M22 15H23.5L24 16H22.5L22 15Z" fill="#FFF"/>
                <path d="M25 13L26 12H24.5L24 13L24.5 14H26L25 13Z" fill="#FFF"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="none" className="h-8 w-auto">
                <rect width="36" height="24" rx="4" fill="#0E4595"/>
                <path d="M21.4 12C21.4 14.8 19.2 17 16.4 17C13.6 17 11.4 14.8 11.4 12C11.4 9.2 13.6 7 16.4 7C19.2 7 21.4 9.2 21.4 12Z" fill="#FFB600"/>
                <path d="M22.8 16L24.5 9.5H27.5L25.8 16H22.8Z" fill="white"/>
                <path d="M28.5 9.5C28.2 9.2 27.6 9 26.8 9C25.2 9 24 10 24 11.5C24 12.7 24.9 13.4 25.6 13.8C26.3 14.2 26.5 14.5 26.5 14.8C26.5 15.3 26 15.5 25.5 15.5C24.9 15.5 24.3 15.3 23.9 15.1L23.7 15L23.5 17.3C23.9 17.5 24.7 17.7 25.5 17.7C27.2 17.7 28.4 16.7 28.4 15.1C28.4 14.2 27.9 13.5 26.9 13C26.3 12.6 25.9 12.4 25.9 12C25.9 11.6 26.3 11.3 26.7 11.3C27.1 11.3 27.4 11.4 27.7 11.5L27.9 11.6L28.5 9.5Z" fill="white"/>
                <path d="M30.5 9.5H32.8L34.5 16H32.2L31.9 14.7H29.5L29 16H26.5L30.5 9.5ZM32.3 12.8L31.3 11.2L30.8 12.8H32.3Z" fill="white"/>
                <path d="M11 16H13.8L15.2 9.5H12.4L11 16Z" fill="white"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="none" className="h-8 w-auto">
                <rect width="36" height="24" rx="4" fill="#003087"/>
                <path d="M15.2 9.5H12.5C12.3 9.5 12.1 9.7 12 9.9L10 16.3C10 16.4 10.1 16.5 10.2 16.5H11.5C11.7 16.5 11.9 16.3 11.9 16.1L12.3 14.5H14.4C14.6 14.5 14.8 14.3 14.8 14.1L15.4 9.7C15.4 9.6 15.3 9.5 15.2 9.5ZM13.2 13H11.9L12.5 10.8H13.8L13.2 13Z" fill="white"/>
                <path d="M24.2 9.5H22.5C22.3 9.5 22.1 9.7 22.1 9.9L20.1 16.3C20.1 16.4 20.2 16.5 20.3 16.5H21.9C22.1 16.5 22.3 16.3 22.3 16.1L22.7 14.5H24.8C25 14.5 25.2 14.3 25.2 14.1L25.8 9.7C25.8 9.6 25.7 9.5 25.6 9.5H24.2ZM23.2 13H21.9L22.5 10.8H23.8L23.2 13Z" fill="white"/>
                <path d="M19.7 9.5H18C17.8 9.5 17.7 9.6 17.6 9.7L15.6 16.3C15.6 16.4 15.7 16.5 15.8 16.5H17.5C17.7 16.5 17.8 16.4 17.9 16.3L19.9 9.7C19.9 9.6 19.8 9.5 19.7 9.5Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
