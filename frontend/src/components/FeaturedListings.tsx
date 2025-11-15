"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Bath, Car, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from '@/components/ui/sonner';
import { API_ENDPOINTS } from '@/config/api';
import { apiHelpers } from '@/utils/apiClient';
interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  currency?: string;
  address: string;
  city: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  main_image?: string;
  rating?: number;
  reviews?: number;
}

const FeaturedListings: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);


  // Error state management
  const [error, setError] = useState<string | null>(null);

  const backendURL = API_ENDPOINTS.BASE_URL;

  // Format price with currency from database
  const formatPrice = (price: number, currency?: string, type?: string) => {
    const currencySymbol = currency === 'USD' ? '$' : 'RWF '
    const formatted = new Intl.NumberFormat('en-US').format(price)
    const base = `${currencySymbol}${formatted}`
    return type === 'rent' ? `${base}/month` : base
  }


  // ------------------- FETCH PROPERTIES -------------------
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiHelpers.getProperties();
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
      }
    } catch (err) {
      setProperties([]);
      setError("Failed to fetch properties. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle error display
  useEffect(() => {
    if (error) {
      // Use setTimeout to ensure this runs after render
      const timer = setTimeout(() => {
        toast.error(error);
        setError(null); // Clear error after showing
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ------------------- VIEW DETAILS -------------------
  const openDetailsModal = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };


  return (
    <section id="properties" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 animate-fade-in-up">
          <div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-red-600 mb-2">
              LATEST PROPERTIES
            </h2>
            <p className="text-lg text-gray-600">
              Fresh Listings Just for You
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-red-600 text-white shadow-lg hover:bg-red-700"
            >
              For Sale
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-white text-red-600 border-2 border-red-600 shadow-lg hover:bg-red-50"
            >
              For Rent
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-white text-gray-600 border-2 border-gray-300 shadow-lg hover:bg-gray-50 flex items-center gap-2"
            >
              See All Properties
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="flex justify-center items-center w-full py-20 text-gray-500">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="flex justify-center items-center w-full py-20 text-gray-500">No properties found.</div>
            ) : (
              properties.map((property, index) => {
                // Generate reference number (CR + property ID with leading zeros)
                const refNumber = `CR ${String(property.id).padStart(3, '0')}`;
                const propertyTypeText = property.type?.toUpperCase() === 'RENT' ? 'FOR RENT' : property.type?.toUpperCase() === 'SALE' ? 'FOR SALE' : 'FOR SALE';
                // Get property type for badge (rent, sale, or other)
                const propertyTypeBadge = property.type ? property.type.toUpperCase() : 'SALE';
                
                // Get badge color based on property type
                const getTypeBadgeColor = (type?: string) => {
                  if (!type) return 'bg-orange-500';
                  const typeLower = type.toLowerCase();
                  if (typeLower === 'rent') return 'bg-green-600';
                  if (typeLower === 'sale') return 'bg-orange-500';
                  return 'bg-orange-500'; // default to orange for sale
                };
                
                return (
                  <div
                    key={property.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-fade-in-up w-full border-2 border-orange-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={property.main_image ? `${backendURL}${property.main_image}` : 'https://via.placeholder.com/400x300'}
                        alt={property.title}
                        className="w-full h-64 object-cover bg-black/5"
                      />
                      {/* Property Type Badge Overlay with Type-based Color */}
                      <div className={`absolute top-4 left-4 ${getTypeBadgeColor(property.type)} text-white px-3 py-1 rounded text-sm font-bold shadow-lg`}>
                        {propertyTypeBadge}
                      </div>
                      {/* Property Type and Location Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
                        <div className="text-white font-bold text-lg mb-1">
                          {propertyTypeText} IN {property.city?.toUpperCase() || 'KIGALI'}
                        </div>
                        <div className="text-white/90 text-sm">
                          {property.city?.toUpperCase() || 'KIGALI'}
                        </div>
                        {property.type === 'rent' && (
                          <div className="text-white/80 text-xs mt-1">
                            {property.bedrooms}BD | {property.bathrooms}BA | {property.area}SQM {formatPrice(property.price, property.currency, property.type)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-heading font-semibold text-xl text-gray-800 mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-4">{property.address}, {property.city}</p>
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-primary">{formatPrice(property.price, property.currency, property.type)}</span>
                        {property.type === 'rent' && (
                          <span className="text-gray-600 ml-1">/month</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-gray-600 mb-6">
                        <div className="flex items-center"><Bed className="w-5 h-5 mr-1" />{property.bedrooms}</div>
                        <div className="flex items-center"><Bath className="w-5 h-5 mr-1" />{property.bathrooms}</div>
                        <div className="flex items-center"><Car className="w-5 h-5 mr-1" />{property.garages}</div>
                        <div className="flex items-center"><Square className="w-5 h-5 mr-1" />{property.area}m²</div>
                      </div>

                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                        onClick={() => openDetailsModal(property)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>




      </div>
    </section>
  );
};

export default FeaturedListings;
