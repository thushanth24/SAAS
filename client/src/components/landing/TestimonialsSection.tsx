import React from 'react';

interface Testimonial {
  content: string;
  authorName: string;
  authorRole: string;
  avatarUrl: string;
  rating: number;
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const { content, authorName, authorRole, avatarUrl, rating } = testimonial;
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <div className="text-yellow-400 flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill={i < rating ? "currentColor" : "none"}
              stroke="currentColor"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-gray-600 italic">{content}</p>
      <div className="mt-6 flex items-center">
        <img 
          src={avatarUrl} 
          alt={authorName} 
          className="h-12 w-12 rounded-full object-cover" 
        />
        <div className="ml-4">
          <h4 className="text-lg font-medium text-gray-900">{authorName}</h4>
          <p className="text-gray-500">{authorRole}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      content: "Setting up my online store with ShopEase was incredibly simple. Within a day, I had a professional-looking store that started generating sales immediately.",
      authorName: "Sarah Johnson",
      authorRole: "Handmade Jewelry Store",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5
    },
    {
      content: "The multi-tenant feature is a game-changer for our business. We can now manage different brands under one account, saving us time and resources.",
      authorName: "David Chen",
      authorRole: "Fashion Retailer",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5
    },
    {
      content: "Customer support is exceptional. Whenever I've had questions or issues, the team responds quickly and resolves everything. The platform is reliable and easy to use.",
      authorName: "Maria Rodriguez",
      authorRole: "Home Goods Store",
      avatarUrl: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      rating: 4.5
    }
  ];

  return (
    <div id="testimonials" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Don't just take our word for it. Here's what store owners think about ShopEase.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
