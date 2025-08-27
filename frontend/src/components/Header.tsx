import React, { useState } from 'react';
import { Menu, X, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useLocation } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

const PropertyForm = ({ formData, handleInputChange, handleSubmit }: any) => (
  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          required
          placeholder="Enter first name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          required
          placeholder="Enter last name"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="phoneNumber">Phone Number</Label>
      <Input
        id="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
        required
        placeholder="Enter phone number"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
        placeholder="Enter email address"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Enter property description"
        required
        className="resize-none"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="type">Property Type</Label>
      <select
        id="type"
        value={formData.property_type}
        onChange={(e) => handleInputChange('property_type', e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="Rent">Rent</option>
        <option value="Sale">Sale</option>
      </select>
    </div>
    <Button type="submit" className="w-full bg-accent hover:bg-accent-light text-white font-medium mt-6">
      Submit Request
    </Button>
  </form>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    description: "",
    property_type: 'Rent',
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send data to your backend
      await axios.post('http://localhost:5000/api/requested-properties', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
        email: formData.email,
        description: formData.description,
        property_type: formData.property_type,
      });

      toast.success("Property request sent successfully ✅");

      // Send data to Web3Forms API
      const web3FormData = {
        access_key: "fa4b5950-e9fb-440a-8953-e3a66d689c51",
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phoneNumber,
        message: formData.description,
        property_type: formData.property_type
      };

      const web3Res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(web3FormData)
      }).then(res => res.json());

      if (web3Res.success) {
        console.log("sent success");
      } else {
        console.error("Failed to send request ❌");
        console.error(web3Res);
      }

      // Close dialog after 3 seconds
      setTimeout(() => setIsDialogOpen(false), 2000);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        description: '',
        property_type: 'Rent',
      });
    } catch (error) {
      console.error(error);
      toast.error("Error adding property ❌");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src="/lovable-uploads/f9b0fb85-8231-4729-b820-3a538fc42c3b.png"
              alt="ISONGA REALTY Logo"
              className="h-8 sm:h-10 lg:h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-primary">
                ISONGA REALTY
              </h1>
              <p className="text-xs text-gray-600 font-medium">WHERE HEART FINDS HOME</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors duration-300 relative ${
                    isActive ? 'text-accent' : 'text-gray-800 hover:text-accent'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* <Button variant="ghost" size="icon" className="text-gray-600 hover:text-accent p-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button> */}

            {/* Desktop Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hidden sm:flex bg-accent hover:bg-accent-light text-white font-medium px-3 sm:px-6 text-sm">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden md:inline">Add Property Request</span>
                  <span className="md:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl font-semibold text-primary">
                    Add Property Request
                  </DialogTitle>
                </DialogHeader>
                <PropertyForm formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
              </DialogContent>
            </Dialog>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`font-medium transition-colors duration-300 ${
                      isActive ? 'text-accent' : 'text-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-accent hover:bg-accent-light text-white font-medium mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Properties
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-primary">
                      Add Property Request
                    </DialogTitle>
                  </DialogHeader>
                  <PropertyForm formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
                </DialogContent>
              </Dialog>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
