"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Star, Bed, Bath, Car, Square, ChevronLeft, ChevronRight, X, ImageIcon,
  MapPin,
  Home,
  CheckCircle,
  
 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Toaster, toast } from '@/components/ui/sonner';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
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

interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
}

const FeaturedListings: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('View All Properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backendURL = 'https://api.isongarealty.com';

  // Currency toggle and formatter
  const [currency, setCurrency] = useState<'RWF' | 'USD'>('RWF');
  const EXCHANGE_RATE_RWF_PER_USD = 1300;

  const formatMoney = (amountRwf: number) => {
    if (currency === 'USD') {
      const usd = amountRwf / EXCHANGE_RATE_RWF_PER_USD;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd);
    }
    return `RWF ${new Intl.NumberFormat('en-US').format(amountRwf)}`;
  };


  // ------------------- FETCH PROPERTIES -------------------
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Property[]>(`${backendURL}/api/properties`);
      if (Array.isArray(res.data)) setProperties(res.data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      toast.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ------------------- SCROLL HANDLERS -------------------
  const scrollLeft = () => { if (containerRef.current) containerRef.current.scrollBy({ left: -300, behavior: 'smooth' }); };
  const scrollRight = () => { if (containerRef.current) containerRef.current.scrollBy({ left: 300, behavior: 'smooth' }); };

  // ------------------- VIEW DETAILS -------------------
  const openDetailsModal = async (property: Property) => {
    setSelectedProperty(property);
    setImagesLoading(true);
    setCurrentImageIndex(0);
    try {
      const res = await axios.get<PropertyImage[]>(`${backendURL}/api/properties/${property.id}/images`);
      if (Array.isArray(res.data)) setPropertyImages(res.data);
      else setPropertyImages([]);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching property images:', err);
      toast.error("Failed to fetch property images");
    } finally {
      setImagesLoading(false);
    }
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="properties" className="py-16 lg:py-24 bg-white">
      <Toaster />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-accent font-semibold text-lg mb-2">Our Listing</p>
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-gray-800 mb-4">
            Find Home Listing in Your Area
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exceptional properties curated for your lifestyle
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex border rounded-full overflow-hidden">
            <button
              className={`px-4 py-2 ${currency === 'RWF' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setCurrency('RWF')}
            >RWF</button>
            <button
              className={`px-4 py-2 ${currency === 'USD' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setCurrency('USD')}
            >USD</button>
          </div>
        </div>

        {/* ----------------- SINGLE ORANGE BUTTON ----------------- */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => navigate('/properties')}
            className="px-6 py-3 rounded-full font-medium transition-all duration-300 bg-orange-500 text-white shadow-lg hover:bg-orange-600"
          >
            View All Properties
          </button>
        </div>

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow hover:bg-accent hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow hover:bg-accent hover:text-white transition-colors duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div ref={containerRef} className="flex gap-8 overflow-x-hidden scroll-smooth px-6">
            {loading ? (
              <div className="flex justify-center items-center w-full py-20 text-gray-500">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="flex justify-center items-center w-full py-20 text-gray-500">No properties found.</div>
            ) : (
              properties.map((property, index) => (
                <div
                  key={property.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-fade-in-up min-w-[300px]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={property.main_image ? `${backendURL}${property.main_image}` : 'https://via.placeholder.com/400x300'}
                      alt={property.title}
                      className="w-full h-64 object-contain bg-black/5"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold ${property.status === 'Featured' ? 'bg-accent' : property.status === 'Hot' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      {property.status || 'New'}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-heading font-semibold text-xl text-gray-800 mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-4">{property.address}, {property.city}</p>
                    <div className="mb-2">
                      <span
                        className={
                          `inline-block px-2 py-1 text-xs font-semibold rounded-full ` +
                          (property.type?.toLowerCase() === 'rent' ? 'bg-blue-100 text-blue-800' :
                           property.type?.toLowerCase() === 'sale' ? 'bg-emerald-100 text-emerald-700' :
                           'bg-gray-100 text-gray-700')
                        }
                      >
                        Status: {property.type ? property.type.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-primary">{formatMoney(property.price)}</span>
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
                      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3"
                      onClick={() => openDetailsModal(property)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ----------------- DETAILS MODAL ----------------- */}
       <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
  <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 bg-white rounded-2xl md:rounded-3xl shadow-2xl flex flex-col">
    
    {/* ----------------- IMAGE SLIDER ----------------- */}
    <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gray-100 flex items-center justify-center">
      {imagesLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-500 text-sm">Loading images...</p>
        </div>
      ) : propertyImages.length > 0 ? (
        <>
          <div className="w-full h-full relative">
            <img
              src={`${backendURL}${propertyImages[currentImageIndex].image_url}`}
              alt={`${selectedProperty?.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain bg-black/5"
            />

            {/* Left/Right Buttons */}
            {propertyImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow hover:bg-white hover:scale-110 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow hover:bg-white hover:scale-110 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {propertyImages.length}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setDetailsModalOpen(false)}
              className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow hover:bg-white hover:scale-110 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16" />
          <p className="text-sm sm:text-base">No images available</p>
        </div>
      )}
    </div>

    {/* ----------------- SCROLLABLE DETAILS ----------------- */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedProperty?.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{selectedProperty?.address}, {selectedProperty?.city}</span>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            {selectedProperty ? formatMoney(selectedProperty.price) : ''}
            {selectedProperty?.type === 'rent' && (
              <span className="text-lg sm:text-xl font-normal text-gray-600">/month</span>
            )}
          </span>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {selectedProperty?.rating || 0}</div>
            <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedProperty?.reviews || 0} reviews</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-gray-700 text-sm sm:text-base">{selectedProperty?.description}</p>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Bed, value: selectedProperty?.bedrooms, label: "Bedrooms", color: "bg-primary/10 text-primary" },
            { icon: Bath, value: selectedProperty?.bathrooms, label: "Bathrooms", color: "bg-blue-100 text-blue-600" },
            { icon: Car, value: selectedProperty?.garages, label: "Garages", color: "bg-green-100 text-green-600" },
            { icon: Square, value: `${selectedProperty?.area}m²`, label: "Area", color: "bg-purple-100 text-purple-600" }
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm hover:shadow-md">
              <div className={`p-2 rounded-lg ${feat.color}`}><feat.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{feat.label}</p>
                <p className="text-lg font-bold text-gray-900">{feat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Home, label: "Property Type", value: selectedProperty?.type, bg: "bg-orange-100 text-orange-600" },
          { icon: CheckCircle, label: "Status", value: selectedProperty?.status, bg: "bg-emerald-100 text-emerald-600" },
          { icon: MapPin, label: "Location", value: selectedProperty?.city, bg: "bg-indigo-100 text-indigo-600" }
        ].map((detail, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${detail.bg}`}><detail.icon className="w-5 h-5" /></div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">{detail.label}</p>
                <p className="font-semibold text-gray-900 truncate">{detail.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

   
  </DialogContent>
</Dialog>



      </div>
    </section>
  );
};

export default FeaturedListings;
