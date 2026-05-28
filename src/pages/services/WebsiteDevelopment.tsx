import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Monitor, Zap, Database, Code2, ShoppingCart, Gauge } from 'lucide-react';

export default function WebsiteDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const features = [
    { icon: Monitor, title: 'Responsive Design', description: 'Pixel-perfect layouts that adapt flawlessly across all devices, from mobile to ultra-wide displays.' },
    { icon: Zap, title: 'Performance Optimization', description: 'Sub-second load times with optimized assets, lazy loading, and modern caching strategies.' },
    { icon: Database, title: 'CMS Integration', description: 'Seamless content management with headless CMS platforms, giving your team full editorial control.' },
    { icon: Code2, title: 'Custom Functionality', description: 'Bespoke features and integrations tailored to your business logic and workflow requirements.' },
    { icon: ShoppingCart, title: 'E-Commerce Solutions', description: 'Scalable online stores with secure payment processing, inventory management, and conversion optimization.' },
    { icon: Gauge, title: 'Core Web Vitals', description: 'Lighthouse-perfect scores ensuring your site meets Google\'s performance and accessibility standards.' },
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Website Development",
    "description": "High-performance, responsive websites engineered for speed, accessibility, and conversion — from marketing sites to complex web applications.",
    "provider": {
      "@type": "Organization",
      "name": "FourIQ Tech",
      "url": "https://fouriqtech.com"
    },
    "url": "https://fouriqtech.com/services/website-development",
    "serviceType": "Website Development"
  };

  const FeaturesSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-[15%] w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ What We Deliver</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">Key <span className="text-gradient">Capabilities</span></h2>
          </motion.div>

          <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={fadeUpVariant} className="glass-card rounded-3xl p-8 hover:border-primary/30 transition-all duration-300">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-4 text-primary mb-6">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  const CTASection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
      <section className="py-28 px-6 lg:px-12 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-primary/[0.02]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant}>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Build Your <span className="text-gradient">Next Website?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Let's discuss your project requirements and craft a high-performance website that drives results for your business.
            </p>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-2"
              >
                Get Started <ArrowUpRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO
        title="Website Development Services"
        description="High-performance, responsive websites engineered for speed, accessibility, and conversion. Custom web development by FourIQ Tech."
        url="https://fouriqtech.com/services/website-development"
        schema={serviceSchema}
      />
      <Navbar isVisible={navVisible} />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative pt-36 pb-20 px-6 lg:px-12 overflow-hidden border-b border-white/5">
          <div className="absolute top-20 right-[15%] w-[450px] h-[450px] bg-primary/[0.04] rounded-full blur-[130px] liquid-blob pointer-events-none" />
          <div className="absolute top-40 left-[10%] w-[350px] h-[350px] bg-accent/[0.03] rounded-full blur-[110px] liquid-blob-2 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUpVariant}>
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] inline-block mb-4">
                ✦ Website Development
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                Websites Built for <span className="text-gradient">Performance & Scale</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
                We engineer high-performance, responsive websites that load fast, rank well, and convert visitors into customers — from marketing sites to complex web applications.
              </p>
            </motion.div>
          </div>
        </section>

        <FeaturesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
