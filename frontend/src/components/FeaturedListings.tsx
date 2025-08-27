"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Star, Bed, Bath, Car, Square, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const backendURL = 'http://localhost:5000';

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
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold ${property.status === 'Featured' ? 'bg-accent' : property.status === 'Hot' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      {property.status || 'New'}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-heading font-semibold text-xl text-gray-800 mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-4">{property.address}, {property.city}</p>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-primary">${property.price}.00</span>
                      <span className="text-gray-600 ml-1">/month</span>
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 bg-white rounded-3xl">
            <div className="relative w-full h-[500px] bg-gray-100 rounded-t-3xl overflow-hidden flex items-center justify-center">
              {imagesLoading ? (
                <p className="text-gray-500">Loading images...</p>
              ) : propertyImages.length > 0 ? (
                <>
                  <img
                    src={`${backendURL}${propertyImages[currentImageIndex].image_url}`}
                    alt="Property"
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  {propertyImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 p-3 rounded-full hover:bg-accent hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 p-3 rounded-full hover:bg-accent hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No images available.</p>
              )}
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800">{selectedProperty?.title}</h2>
                <span className="text-2xl font-semibold text-primary">${selectedProperty?.price}.00 / month</span>
              </div>
              <p className="text-gray-600">{selectedProperty?.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-gray-700">
                <div className="flex items-center gap-2"><Bed /> {selectedProperty?.bedrooms} Bedrooms</div>
                <div className="flex items-center gap-2"><Bath /> {selectedProperty?.bathrooms} Bathrooms</div>
                <div className="flex items-center gap-2"><Car /> {selectedProperty?.garages} Garages</div>
                <div className="flex items-center gap-2"><Square /> {selectedProperty?.area} m²</div>
                <div className="flex items-center gap-2"><Star /> {selectedProperty?.rating || 0} Rating</div>
                <div className="flex items-center gap-2"><Eye /> {selectedProperty?.reviews || 0} Reviews</div>
              </div>

              <div className='flex flex-wrap mt-4 mb-4 gap-4 md:gap-8 text-gray-700'>
                <p className="text-gray-600"><strong>Address:</strong> {selectedProperty?.address}, {selectedProperty?.city}</p>
                <p className="text-gray-600"><strong>Type:</strong> {selectedProperty?.type}</p>
                <p className="text-gray-600"><strong>Status:</strong> {selectedProperty?.status}</p>
              </div>
            </div>

            <DialogFooter className="flex justify-end p-8">
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default FeaturedListings;
