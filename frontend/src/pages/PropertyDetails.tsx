"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bed, Bath, Car, Square, ImageIcon,
  MapPin,
  Home,
  CheckCircle,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from '@/components/ui/sonner';
import { API_ENDPOINTS } from '@/config/api';
import { apiHelpers } from '@/utils/apiClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
}

interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const backendURL = API_ENDPOINTS.BASE_URL;

  // Format price with currency from database
  const formatPrice = (price: number, currency?: string, type?: string) => {
    const currencySymbol = currency === 'USD' ? '$' : 'RWF '
    const formatted = new Intl.NumberFormat('en-US').format(price)
    const base = `${currencySymbol}${formatted}`
    return type === 'rent' ? `${base}/month` : base
  }

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) {
        setError("Property ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [propertyData, imagesData] = await Promise.all([
          apiHelpers.getPropertyById(Number(id)),
          apiHelpers.getPropertyImages(Number(id))
        ]);

        if (propertyData) {
          setProperty(propertyData);
        } else {
          setError("Property not found");
        }

        if (Array.isArray(imagesData)) {
          setPropertyImages(imagesData);
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        toast.error(error);
        setError(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [error]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Property not found</p>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  const refNumber = `CR ${String(property.id).padStart(3, '0')}`;
  const displayImages = propertyImages.length > 0 ? propertyImages : 
    (property.main_image ? [{ id: 0, property_id: property.id, image_url: property.main_image }] : []);
  const mainImage = displayImages[selectedImageIndex] || displayImages[0];
  const thumbnailImages = displayImages;

  // Navigation functions
  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster />
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 lg:px-8 pt-24 pb-12 lg:pt-28 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE: IMAGE GALLERY */}
          <div className="w-full lg:w-[60%] space-y-4">
            {/* Property Title and Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-lg text-gray-600 mb-2">
                {property.type === 'rent' ? 'Apartments For Rent' : property.type === 'sale' ? 'Apartments For Sale' : 'Apartments For Sale/Rent'}
              </p>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.city?.toLowerCase()}</span>
              </div>
            </div>

            {/* Main Large Image */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-xl">
              {mainImage ? (
                <img
                  src={`${backendURL}${mainImage.image_url}`}
                  alt={`${property.title} - Main Image`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
                  <ImageIcon className="w-16 h-16" />
                  <p className="text-base">No images available</p>
                </div>
              )}
              
              {/* Navigation Arrows - Always visible if there are multiple images */}
              {displayImages.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  {/* Right Arrow */}
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images Row */}
            {thumbnailImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 mt-6">
                {thumbnailImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex 
                        ? 'border-orange-500 scale-105 shadow-lg' 
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={`${backendURL}${img.image_url}`}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: PROPERTY DETAILS SIDEBAR */}
          <div className="w-full lg:w-[40%] flex flex-col bg-white">
            <div className="sticky top-8 space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Price */}
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-4">
                {formatPrice(property.price, property.currency, property.type)}
                {property.type === 'rent' && (
                  <span className="text-xl font-normal text-gray-600">/month</span>
                )}
              </div>

            {/* Property Details Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bed className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-500">Bedrooms</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bath className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-500">Bathrooms</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-500">Garages</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{property.garages}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Square className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-500">Area</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{property.area}m²</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="text-sm text-gray-500">Property Type</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 capitalize">{property.type}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-gray-500">Status</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 capitalize">{property.status}</p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Sales Agent</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <a href="mailto:isongarealty@gmail.com" className="text-gray-700 hover:text-primary transition-colors">
                      isongarealty@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <a href="tel:+250791824755" className="text-gray-700 hover:text-primary transition-colors">
                      +250 791 824 755
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => window.open('tel:+250791824755', '_self')}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-6"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call</span>
                </Button>
                <Button
                  onClick={() => window.open('mailto:isongarealty@gmail.com?subject=Inquiry about ' + encodeURIComponent(property.title), '_self')}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-6"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </Button>
                <Button
                  onClick={() => {
                    const propertyImage = property.main_image ? `${backendURL}${property.main_image}` : '';
                    const message = `Hello! I'm interested in this property:\n\n*${property.title}*\n\nReference: ${refNumber}\nType: ${property.type?.toUpperCase()}\nPrice: ${formatPrice(property.price, property.currency, property.type)}\nLocation: ${property.address}, ${property.city}\nBedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms} | Garages: ${property.garages}\nArea: ${property.area}m²\n\n${propertyImage ? `View property: ${propertyImage}` : ''}`;
                    window.open(`https://wa.me/250791824755?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center gap-2 py-6"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </Button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PropertyDetails;

