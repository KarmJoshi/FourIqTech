import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Smartphone, Layers, Wifi, Rocket, Shield, RefreshCw } from 'lucide-react';

export default function AppDevelopment() {
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
    { icon: Layers, title: 'Cross-Platform Development', description: 'Build once, deploy everywhere with React Native and Flutter — reaching iOS and Android users simultaneously.' },
    { icon: Smartphone, title: 'Native Performance', description: 'Smooth 60fps animations, instant transitions, and hardware-accelerated rendering for a truly native feel.' },
    { icon: Wifi, title: 'API Integration', description: 'Seamless connectivity with REST and GraphQL APIs, third-party services, and real-time data synchronization.' },
    { icon: Rocket, title: 'App Store Deployment', description: 'End-to-end submission handling for Apple App Store and Google Play, including compliance and optimization.' },
    { icon: Shield, title: 'Security & Authentication', description: 'Enterprise-grade security with biometric auth, encrypted storage, and secure communication protocols.' },
    { icon: RefreshCw, title: 'Continuous Updates', description: 'OTA updates, CI/CD pipelines, and automated testing to keep your app current without user friction.' },
  ];

  const serviceSchema = {
    name: "App Development",
    description: "Cross-platform and native mobile applications built for scale, with seamless API integrations and polished user experiences.",
    areaServed: "Worldwide",
    offers: [
      { name: "Cross-Platform Development", description: "Build once, deploy everywhere with React Native and Flutter", price: "8000", currency: "USD" },
      { name: "Native iOS/Android", description: "Native mobile applications with Swift/Kotlin", price: "12000", currency: "USD" },
      { name: "API Integration", description: "Seamless connectivity with REST and GraphQL APIs", price: "3000", currency: "USD" }
    ]
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
              Ready to Launch Your <span className="text-gradient">Mobile App?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Let's turn your app idea into a polished, high-performance product that users love and app stores feature.
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
        title="Mobile App Development Services | FouriqTech"
        description="Cross-platform and native mobile applications built for scale. React Native, Flutter, and native iOS/Android development by FourIQ Tech."
        url="https://www.fouriqtech.com/services/app-development"
        service={serviceSchema}
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
                ✦ App Development
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                Mobile Apps That <span className="text-gradient">Users Love</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
                We build cross-platform and native mobile applications with seamless API integrations, polished UX, and the performance users expect from top-tier apps.
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
