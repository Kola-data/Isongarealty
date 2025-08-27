
import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import PropertyTypesSection from '../components/PropertyTypesSection';
import FeaturedListings from '../components/FeaturedListings';
import TopLocations from '../components/TopLocations';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';


const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PropertyTypesSection />
      <FeaturedListings />
      <TopLocations />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
