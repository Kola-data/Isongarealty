import React from 'react';
import { MapPin, Phone, Mail, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    'Properties', 'Services', 'About Us', 'Our Team', 'Contact', 'Blog', 'FAQ', 'Support'
  ];

  const services = [
    'Property Sales', 'Property Rentals', 'Property Development', 'Land Title Services', 
    'Property Management', 'Investment Consulting', 'Property Valuation', 'Legal Support'
  ];

  const legalLinks = [
    'Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Site Map'
  ];

  const statistics = [
    { number: '500+', label: 'Properties Sold' },
    { number: '1,200+', label: 'Happy Clients' },
    { number: '10+', label: 'Years Experience' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <footer id="contact" className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full -translate-x-32 translate-y-32"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Statistics Section */}
        <div className="py-16 border-b border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statistics.map((stat, index) => (
              <div 
                key={stat.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/lovable-uploads/3fc4993c-d09a-42bd-9981-77e51fe7d1c3.png" 
                  alt="ISONGA REALTY Logo" 
                  className="h-12 w-auto"
                />
                <div>
                  <h3 className="font-heading font-bold text-xl">ISONGA REALTY</h3>
                  <p className="text-accent text-sm font-medium">WHERE HEART FINDS HOME</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Your trusted partner in Rwanda real estate. We specialize in property development, 
                sales, rentals, and land title services across Kigali and beyond.
              </p>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/isonga_realty/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@isonga_realty" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300"
                >
                  <span className="text-sm font-bold">TT</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/isonga-realty-b83294370/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://wa.me/250791824755" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-300"
                >
                  <span className="text-sm font-bold">WA</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase().replace(' ', '-')}`}
                      className="text-white/80 hover:text-accent transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Our Services</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service}>
                    <span className="text-white/80 hover:text-accent transition-colors duration-300 cursor-pointer">
                      {service}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white/80">
                      KG 9 Ave, Nyarutarama<br />
                      Gasabo District<br />
                      Kigali, Rwanda
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                  <a 
                    href="tel:+250791824755"
                    className="text-white/80 hover:text-accent transition-colors duration-300"
                  >
                    +250 791 824 755
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                  <a 
                    href="mailto:isongarealty@gmail.com"
                    className="text-white/80 hover:text-accent transition-colors duration-300"
                  >
                    isongarealty@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/60">
              © 2024 <a href="/login">ISONGA REALTY.</a> All rights reserved.
            </div>
            
            <div className="flex flex-wrap gap-6">
              {legalLinks.map((link) => (
                <a 
                  key={link}
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="text-white/60 hover:text-accent transition-colors duration-300 text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
