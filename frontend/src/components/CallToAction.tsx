
import React from 'react';
import { Phone, Mail, MessageCircle, Clock, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  const trustIndicators = [
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Always available'
    },
    {
      icon: Award,
      title: '100% Satisfaction',
      description: 'Guaranteed results'
    },
    {
      icon: Users,
      title: '10+ Years',
      description: 'Industry experience'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-accent/10 rounded-full -translate-x-16 sm:-translate-x-32 -translate-y-16 sm:-translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-accent/5 rounded-full translate-x-24 sm:translate-x-48 translate-y-24 sm:translate-y-48"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-32 sm:h-32 bg-accent/10 rounded-full"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="mb-8 sm:mb-12 animate-fade-in-up">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight px-4">
              Ready to invest, design, or rent in Rwanda?{' '}
              <span className="text-accent">Let's talk today.</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-4">
              Get professional consultation from our expert team. We're here to help you 
              find the perfect property solution in Rwanda.
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Get in Touch Button */}
            <div className="mb-4 sm:mb-6">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent text-white font-bold text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Get in Touch
              </Button>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-accent mx-auto mb-3 sm:mb-4" />
                <h3 className="font-heading font-semibold text-base sm:text-lg mb-2">Call Us</h3>
                <a 
                  href="tel:+250791824755" 
                  className="text-white/90 hover:text-accent transition-colors duration-300 text-sm sm:text-base"
                >
                  +250 791 824 755
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-accent mx-auto mb-3 sm:mb-4" />
                <h3 className="font-heading font-semibold text-base sm:text-lg mb-2">Email Us</h3>
                <a 
                  href="mailto:isongarealty@gmail.com" 
                  className="text-white/90 hover:text-accent transition-colors duration-300 text-sm sm:text-base break-all"
                >
                  isongarealty@gmail.com
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-accent mx-auto mb-3 sm:mb-4" />
                <h3 className="font-heading font-semibold text-base sm:text-lg mb-2">WhatsApp</h3>
                <a 
                  href="https://wa.me/250791824755" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-accent transition-colors duration-300 text-sm sm:text-base"
                >
                  Quick Chat
                </a>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-white/20">
            {trustIndicators.map((indicator, index) => (
              <div 
                key={indicator.title}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <indicator.icon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                </div>
                <h4 className="font-heading font-semibold text-base sm:text-lg mb-2">
                  {indicator.title}
                </h4>
                <p className="text-white/80 text-sm sm:text-base">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
