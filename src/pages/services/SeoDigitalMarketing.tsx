import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, Target, FileText, BarChart3, Link2, TrendingUp } from 'lucide-react';

export default function SeoDigitalMarketing() {
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
    { icon: Search, title: 'Technical SEO Audits', description: 'Comprehensive site audits covering crawlability, indexation, Core Web Vitals, and structured data implementation.' },
    { icon: Target, title: 'Keyword Strategy', description: 'Data-driven keyword research identifying high-intent opportunities aligned with your business goals and audience.' },
    { icon: FileText, title: 'Content Optimization', description: 'On-page optimization, content gap analysis, and strategic content creation that ranks and converts.' },
    { icon: BarChart3, title: 'Analytics Setup', description: 'Full-stack analytics implementation with custom dashboards, conversion tracking, and actionable reporting.' },
    { icon: Link2, title: 'Link Building', description: 'White-hat link acquisition strategies that build domain authority and drive referral traffic from relevant sources.' },
    { icon: TrendingUp, title: 'Performance Tracking', description: 'Continuous monitoring of rankings, traffic, and conversions with monthly reporting and strategy adjustments.' },
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "SEO & Digital Marketing",
    "description": "Data-backed strategies to improve search visibility, drive qualified traffic, and maximize your digital presence.",
    "provider": {
      "@type": "Organization",
      "name": "FourIQ Tech",
      "url": "https://fouriqtech.com"
    },
    "url": "https://fouriqtech.com/services/seo-digital-marketing",
    "serviceType": "SEO & Digital Marketing"
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
              Ready to Dominate <span className="text-gradient">Search Results?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Let's build a data-driven SEO and marketing strategy that drives qualified traffic and measurable growth for your business.
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
        title="SEO & Digital Marketing Services"
        description="Data-backed SEO and digital marketing strategies to improve search visibility, drive qualified traffic, and grow your business. By FourIQ Tech."
        url="https://fouriqtech.com/services/seo-digital-marketing"
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
                ✦ SEO & Digital Marketing
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                Grow Your <span className="text-gradient">Online Visibility</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
                We deploy data-backed strategies to improve search rankings, drive qualified organic traffic, and maximize your digital presence across every channel.
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
