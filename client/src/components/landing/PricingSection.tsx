import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface PlanFeature {
  text: string;
}

interface PricingPlanProps {
  name: string;
  description: string;
  price: number;
  popular?: boolean;
  features: PlanFeature[];
}

const PricingPlan: React.FC<PricingPlanProps> = ({ 
  name, 
  description, 
  price, 
  popular = false, 
  features 
}) => {
  const { openAuthModal } = useAuth();

  return (
    <div 
      className={cn(
        "p-8 rounded-lg flex flex-col relative",
        popular 
          ? "bg-primary text-white shadow-lg transform scale-105" 
          : "bg-white border border-gray-100 shadow-sm"
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-secondary-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          POPULAR
        </div>
      )}
      
      <h3 className={cn(
        "text-xl font-medium",
        popular ? "text-white" : "text-gray-900"
      )}>
        {name}
      </h3>
      
      <p className={cn(
        "mt-2",
        popular ? "text-primary-100" : "text-gray-500"
      )}>
        {description}
      </p>
      
      <div className="mt-4 flex items-baseline">
        <span className={cn(
          "text-4xl font-extrabold",
          popular ? "text-white" : "text-gray-900"
        )}>
          ${price}
        </span>
        <span className={cn(
          "ml-1 text-xl font-medium",
          popular ? "text-primary-100" : "text-gray-500"
        )}>
          /month
        </span>
      </div>
      
      <ul className="mt-6 space-y-4 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "h-5 w-5 mt-0.5 mr-2",
                popular ? "text-white" : "text-green-500"
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className={cn(
              popular ? "text-white" : "text-gray-600"
            )}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={() => openAuthModal('register')}
        className={cn(
          "mt-8",
          popular 
            ? "bg-white text-primary hover:bg-gray-100" 
            : "bg-white text-primary border border-primary hover:bg-primary-50"
        )}
      >
        Choose {name}
      </Button>
    </div>
  );
};

const PricingSection: React.FC = () => {
  return (
    <div id="pricing" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Choose the plan that works best for your business needs.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingPlan
            name="Basic"
            description="Perfect for small businesses just getting started"
            price={29}
            features={[
              { text: "Up to 100 products" },
              { text: "2% transaction fee" },
              { text: "Basic store customization" },
              { text: "Email support" },
            ]}
          />
          
          <PricingPlan
            name="Professional"
            description="Ideal for growing businesses with more needs"
            price={79}
            popular={true}
            features={[
              { text: "Up to 1,000 products" },
              { text: "1% transaction fee" },
              { text: "Advanced store customization" },
              { text: "Priority email support" },
              { text: "Analytics dashboard" },
            ]}
          />
          
          <PricingPlan
            name="Enterprise"
            description="For large businesses with high volume sales"
            price={199}
            features={[
              { text: "Unlimited products" },
              { text: "0.5% transaction fee" },
              { text: "Full store customization" },
              { text: "24/7 phone & email support" },
              { text: "Advanced analytics & reporting" },
              { text: "Custom integrations" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
