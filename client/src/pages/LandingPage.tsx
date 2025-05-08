import React, { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet';

const LandingPage: React.FC = () => {
  const { authModalOpen, closeAuthModal, authModalView } = useAuth();

  return (
    <>
      <Helmet>
        <title>ShopEase - Multi-Tenant E-Commerce Platform</title>
        <meta name="description" content="ShopEase helps you build and run your online business with powerful tools that make selling online easy, from product management to secure payments." />
        <meta property="og:title" content="ShopEase - Multi-Tenant E-Commerce Platform" />
        <meta property="og:description" content="Create your online store in minutes with ShopEase's powerful e-commerce platform." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="landing-view">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </div>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={closeAuthModal} 
        initialView={authModalView}
      />
    </>
  );
};

export default LandingPage;
