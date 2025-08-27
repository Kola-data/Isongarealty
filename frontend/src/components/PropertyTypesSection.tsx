
import React, { useState } from 'react';
import { Building, Briefcase, Home, FileText, Settings, TrendingUp, Calculator, Scale, ChevronDown, ChevronUp } from 'lucide-react';

const PropertyTypesSection = () => {
  const [showServices, setShowServices] = useState(true);

  const services = [
    {
      icon: Building,
      name: 'Property Sales',
      description: 'Expert assistance in buying and selling properties'
    },
    {
      icon: Home,
      name: 'Property Rentals',
      description: 'Comprehensive rental services and management'
    },
    {
      icon: Briefcase,
      name: 'Property Development',
      description: 'End-to-end property development solutions'
    },
    {
      icon: FileText,
      name: 'Land Title Services',
      description: 'Professional land title processing and verification'
    },
    {
      icon: Settings,
      name: 'Property Management',
      description: 'Complete property management services'
    },
    {
      icon: TrendingUp,
      name: 'Investment Consulting',
      description: 'Strategic real estate investment guidance'
    },
    {
      icon: Calculator,
      name: 'Property Valuation',
      description: 'Accurate property assessment and valuation'
    },
    {
      icon: Scale,
      name: 'Legal Support',
      description: 'Comprehensive legal assistance for property matters'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-800 mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Comprehensive real estate services tailored to your needs in Rwanda
          </p>
        </div>

        {/* Services Button */}
        {/* <div className="text-center mb-8">
          <button
            onClick={() => setShowServices(!showServices)}
            className="group bg-accent hover:bg-accent-light text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
          >
            <Briefcase className="w-5 h-5" />
            <span>View All Services</span>
            {showServices ? (
              <ChevronUp className="w-5 h-5 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>
        </div> */}

        {/* Services Grid */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showServices ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <div
                key={service.name}
                className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-accent/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <service.icon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                </div>
                
                <h3 className="font-heading font-semibold text-lg sm:text-xl text-gray-800 mb-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyTypesSection;
