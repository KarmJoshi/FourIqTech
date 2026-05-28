import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { services as serviceCatalogData } from '@/data/services';

const serviceCatalog = serviceCatalogData.map((s) => ({
  icon: s.icon,
  badge: s.badge,
  title: s.title,
  desc: s.description,
  path: s.path,
}));

export default function Services() {
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO 
        title="Bespoke Digital & Software Services | FouriqTech" 
        description="Discover elite software solutions at FouriqTech. From custom SaaS platforms and legacy modernization to next-generation headless commerce and React scaling." 
        url="https://fouriqtech.com/services" 
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full pt-36 pb-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-[5%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px] liquid-blob pointer-events-none" />
        <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px] liquid-blob-2 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <span className="text-primary text-sm font-heading font-medium tracking-[0.2em] uppercase">✦ Technical Capabilities</span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mt-4 mb-6 leading-tight">
              Engineered for <span className="text-gradient">Exponential Scale</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              We specialize in resolving complex technical bottlenecks and delivering high-fidelity design layouts built directly for commercial velocity.
            </p>
          </motion.div>

          {/* Grid Catalog */}
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible" 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-28"
          >
            {serviceCatalog.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div 
                  key={i} 
                  variants={fadeUpVariant} 
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 transition-[border-color,transform] duration-500 hover:border-primary/45 hover:scale-[1.02] flex flex-col justify-between min-h-[320px]"
                >
                  {/* Subtle glows */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl opacity-40 group-hover:bg-primary/20 transition-all pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-4 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                        <Icon size={26} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-heading font-semibold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-all">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-500 leading-snug">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90 transition-colors">
                      {service.desc}
                    </p>
                  </div>

                  <div className="mt-8 relative z-10 pt-4 border-t border-white/5 flex items-center justify-between text-sm font-medium text-zinc-500 group-hover:text-primary transition-all">
                    <Link to={service.path} className="w-full flex items-center justify-between group-hover:underline">
                      <span>Explore Service</span>
                      <ArrowUpRight size={18} className="transform transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Consultation CTA */}
          <div className="border-t border-white/5 pt-24 relative">
            <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
            
            <div className="glass-strong rounded-3xl p-10 lg:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  <span className="text-primary text-sm font-heading font-medium tracking-[0.2em] uppercase">✦ Custom Engineering Plans</span>
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Not Sure Which Technical <br />Architecture Fits Your Need?
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                    Schedule a free, details-oriented architectural evaluation with our senior team. We will review your legacy stack, diagnose bottlenecks, and map out a bespoke roadmap.
                  </p>
                </div>
                <div className="lg:col-span-4 lg:text-right">
                  <a href="/contact">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                      whileTap={{ scale: 0.95 }}
                      className="py-4 px-8 bg-primary text-primary-foreground font-heading font-bold rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-2 cursor-pointer"
                    >
                      Book Free Consultation <ArrowUpRight size={18} />
                    </motion.button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
