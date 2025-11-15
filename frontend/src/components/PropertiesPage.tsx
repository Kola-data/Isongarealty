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
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');


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

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiHelpers.getProperties();
      if (Array.isArray(data)) {
        setProperties(data);
        setFilteredProperties(data);
      }
    } catch (err) {
      setError("Failed to fetch properties. Please check your internet connection.");
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

  // Filter & Search
  useEffect(() => {
    let filtered = [...properties];

    if (search) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterType !== 'All') filtered = filtered.filter(p => p.type === filterType);
    if (filterStatus !== 'All') filtered = filtered.filter(p => p.status === filterStatus);

    setFilteredProperties(filtered);
  }, [search, filterType, filterStatus, properties]);

  // View property details
  const openDetailsModal = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <section id="properties" className="py-16 lg:py-24 bg-white">
      <Toaster />
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-accent font-semibold text-lg mb-2">Our Listings</p>
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-gray-800 mb-4">
            Find the Perfect Home for You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore a curated collection of premium properties designed to match your lifestyle. Filter by type, status, or search for your dream location.
          </p>
        </div>


        {/* Filters & Search */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <input
            type="text"
            placeholder="Search by city, title, or address"
            className="px-4 py-2 border-2 border-orange-500 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
            autoComplete="off"
          >
            <option value="All">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
            autoComplete="off"
          >
            <option value="All">All Status</option>
            <option value="Featured">Featured</option>
            <option value="Hot">Hot</option>
            <option value="New">New</option>
          </select>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center w-full py-20 text-gray-500">Loading properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex justify-center items-center w-full py-20 text-gray-500">No properties found.</div>
        ) : (
          <div className="flex flex-wrap gap-8">
            {filteredProperties.map((property) => {
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
                <div key={property.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden w-full max-w-sm border-2 border-orange-500">
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
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedListings;
