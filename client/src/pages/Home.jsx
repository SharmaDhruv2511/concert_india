import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedSection from '../components/FeaturedSection';
import TrailersSection from '../components/TrailersSection';

const Home = () => {
  // Debug: Remove this after confirming the page renders
  // return <div style={{color: 'white'}}>Home Page Loaded</div>;

  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <TrailersSection />
    </>
  );
};

export default Home;
