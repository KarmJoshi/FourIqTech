import { useState, useEffect } from 'react';
import { useScrollLock } from '@/components/SmoothScroll';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import HorizontalShowcase from '@/components/HorizontalShowcase';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import ProcessSection from '@/components/ProcessSection';
import TechStack from '@/components/TechStack';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Index = () => {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    // Only use Lenis lock — never touch body overflow (causes CLS from scrollbar shift)
    if (navVisible) {
      setScrollLocked(false);
    } else {
      setScrollLocked(true);
    }
    return () => {
      setScrollLocked(false);
    };
  }, [navVisible, setScrollLocked]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="FouriqTech - Web Design & Digital Marketing Agency in Gujarat"
        description="Leading web design and digital marketing agency in Gujarat. Custom websites, SEO, social media marketing. Affordable packages for startups & SMEs. Get a free quote!"
        url="https://four-iq-tech.vercel.app"
      />
      <Navbar isVisible={navVisible} />
      <HeroSection onComplete={() => setNavVisible(true)} />
      <TechStack />
      <ServicesSection />
      <ProcessSection />
      <HorizontalShowcase />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
