
import React, { useState } from 'react';
import { Search, MapPin, Building, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [searchData, setSearchData] = useState({
    keyword: '',
    category: 'Residential',
    location: 'Kigali',
    status: 'For Sale'
  });

  const tabs = ['General', 'Villa', 'Apartment'];
  const categories = ['Residential', 'Commercial', 'Land'];
  const locations = ['Kigali', 'Gacuriro', 'Kinyinya', 'Nyarutarama', 'Kimironko'];
  const statuses = ['For Sale', 'For Rent'];

  const heroImages = [
    {
      src: "/lovable-uploads/7f5dd07c-3adf-478b-9e1e-62a4d1d39677.png",
      alt: "Modern Dream House in Rwanda"
    },
    {
      src: "/lovable-uploads/a966ee06-0a33-4ddf-84c3-dd0aa052e9a5.png",
      alt: "Contemporary Villa Architecture"
    },
    {
      src: "/lovable-uploads/adb89cab-46fe-4b27-bab0-7c8dc877c470.png",
      alt: "Happy Family with New Home"
    },
    {
      src: "/lovable-uploads/21d75a46-0a46-4286-bd8f-5b626e7dc86b.png",
      alt: "Real Estate Agent Handing Keys"
    },
    {
      src: "/lovable-uploads/b7d7d53a-028a-40ee-8b9d-c518bc77f1a0.png",
      alt: "Family Receiving House Keys"
    },
    {
      src: "/lovable-uploads/a8cd5a0b-62eb-4831-830d-18981c2e3f55.png",
      alt: "Luxury Home with Family"
    }
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-14 sm:pt-16 lg:pt-20 overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <Carousel className="w-full h-full" opts={{ loop: true, duration: 20 }}>
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative w-full h-full">
                  <img 
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/40"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-10 sm:w-10" />
          <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-10 sm:w-10" />
        </Carousel>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Main Content */}
          <div className="text-white">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-4 sm:mb-6">
              Let's Find Your{' '}
              <span className="block">Dream House.</span>
            </h1>

            {/* Search Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 max-w-4xl">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                      activeTab === tab
                        ? 'bg-accent text-white shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Keyword */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-white/80 text-sm font-medium mb-2">Keyword</label>
                  <Input
                    placeholder="Enter keyword..."
                    value={searchData.keyword}
                    onChange={(e) => setSearchData({...searchData, keyword: e.target.value})}
                    className="h-10 sm:h-12 bg-white/90 border-white/30 focus:border-accent text-gray-800 placeholder:text-gray-500"
                  />
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
                  <select 
                    value={searchData.category}
                    onChange={(e) => setSearchData({...searchData, category: e.target.value})}
                    className="w-full h-10 sm:h-12 px-3 bg-white/90 border border-white/30 rounded-md focus:border-accent focus:outline-none text-gray-800 text-sm sm:text-base"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
                  <select 
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    className="w-full h-10 sm:h-12 px-3 bg-white/90 border border-white/30 rounded-md focus:border-accent focus:outline-none text-gray-800 text-sm sm:text-base"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
                  <select 
                    value={searchData.status}
                    onChange={(e) => setSearchData({...searchData, status: e.target.value})}
                    className="w-full h-10 sm:h-12 px-3 bg-white/90 border border-white/30 rounded-md focus:border-accent focus:outline-none text-gray-800 text-sm sm:text-base"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-transparent text-sm font-medium mb-2">Search</label>
                  <Button className="w-full h-10 sm:h-12 bg-accent hover:bg-accent-light text-white font-semibold shadow-lg text-sm sm:text-base">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs sm:text-sm">Commercial - 5</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs sm:text-sm">Villa - 8</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-xs sm:text-sm">Sales - 12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
