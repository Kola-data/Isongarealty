
import React from 'react';

const TopLocations = () => {
  const locations = [
    {
      id: 1,
      name: 'Nyarutarama',
      subtitle: 'Premium Residential Area',
      propertyCount: 12,
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Gacuriro',
      subtitle: 'Modern Business District',
      propertyCount: 8,
      image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Kinyinya',
      subtitle: 'Family-Friendly Community',
      propertyCount: 15,
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80',
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <p className="text-accent font-semibold text-base sm:text-lg mb-2">Our Property List</p>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl mb-4 leading-tight">
            Our Top Location For You Property
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto px-4">
            Explore the most sought-after locations in Kigali
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {locations.map((location, index) => (
            <div
              key={location.id}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image */}
              <div className="aspect-w-16 aspect-h-12 relative">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="text-accent font-bold text-base sm:text-lg mb-2">
                  {location.propertyCount} Properties
                </div>
                
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white mb-2">
                  {location.name}
                </h3>
                
                <p className="text-white/90 text-sm sm:text-lg">
                  {location.subtitle}
                </p>

                {/* Hover Effect - Additional Info */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mt-4">
                  <div className="w-12 h-1 bg-accent rounded-full"></div>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/40 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopLocations;
