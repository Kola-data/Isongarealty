
import React from 'react';
import Header from '../components/Header';

import Footer from '../components/Footer';
import PropertiesPage from "../components/PropertiesPage";


const Properties = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PropertiesPage />
      <Footer />
    </div>
  );
};

export default Properties;
