import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import NewArrivals from '@/components/home/NewArrivals';
import CategorySections from '@/components/home/CategorySection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategoryShowcase />
      <NewArrivals />
      <PromoBanner />
      <FeaturedProducts />
      <CategorySections />
    </div>
  );
}