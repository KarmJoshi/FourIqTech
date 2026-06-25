import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowRight, 
  CheckCircle2, 
  Gauge, 
  Zap, 
  Globe, 
  Layout, 
  FileCode2, 
  Server, 
  Activity, 
  ShieldCheck,
  Search,
  ZapIcon
} from 'lucide-react';

export default function WebPerformanceOptimization() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);
  }, [setScrollLocked]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Performance Optimization Services",
    "provider": {
      "@type": "Organization",
      "name": "FourIQ Tech"
    },
    "description": "Enterprise-grade web performance optimization focusing on Core Web Vitals, LCP reduction, and technical SEO improvements.",
    "areaServed": "Global",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Performance Engineering",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Core Web Vitals Optimization"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Edge Orchestration and Caching"
          }
        }
      ]
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const SectionRef = ({ children, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
      <motion.div 
        ref={ref} 
        initial="hidden" 
        animate={isInView ? "visible" : "hidden"} 
        variants={fadeUp} 
        className={className}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO 
        title="Web Performance Optimization Services | FourIQ Tech" 
        description="Maximize your site speed with our expert web performance optimization services. Improve Core Web Vitals, user retention, and SEO rankings for global enterprises." 
        url="https://fouriqtech.com/services/web-performance-optimization" 
        schema={serviceSchema} 
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative pt-36 pb-24 px-6 lg:px-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl">
              <motion.span variants={fadeUp} className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 block">
                ✦ Performance Engineering
              </motion.span>
              <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8">
                Fast Sites <span className="text-gradient">Outperform.</span> Period.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                FourIQ Tech delivers technical excellence in performance engineering. We transform sluggish enterprise platforms into high-speed digital assets that drive conversions and dominate search rankings.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link to="/contact" className="bg-primary text-primary-foreground font-heading font-semibold px-8 py-4 rounded-xl glow-box flex items-center gap-2 group transition-all duration-300">
                  Get a Free Performance Audit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/services" className="border border-white/10 hover:bg-white/5 font-heading font-semibold px-8 py-4 rounded-xl transition-all duration-300">
                  Explore Services
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* RESULTS BAR */}
        <section className="border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {[
                { label: 'Sub-100ms', value: 'INP Latency' },
                { label: '62%', value: 'LCP Reduction' },
                { label: '99/100', value: 'Lighthouse Score' },
                { label: '24%', value: 'Conversion Lift' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="font-display text-3xl md:text-4xl font-bold text-gradient">{stat.label}</span>
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-24 px-6 lg:px-12 relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <SectionRef>
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 block">
                ✦ The Bottom Line
              </span >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Is a Slow Site <span className="text-gradient">Costing</span> You Revenue?
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Every 100ms delay can slash conversion rates by 7%. In the era of Core Web Vitals, poor performance isn't just a technical glitch—it is a business risk that leads to high bounce rates and SEO penalties.
              </p>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We bridge the gap between heavy enterprise features and the lightweight execution speed users demand.
              </p>
            </SectionRef>
            <SectionRef className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-6 rounded-2xl border-red-500/10">
                <div className="text-red-400 font-bold text-xl mb-2">High Bounce</div>
                <p className="text-sm text-muted-foreground">Slow loads result in immediate user abandonment before your brand even makes an impression.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl border-red-500/10">
                <div className="text-red-400 font-bold text-xl mb-2">SEO Decline</div>
                <p className="text-sm text-muted-foreground">Google actively de-ranks sites that fail to meet minimum Core Web Vital thresholds.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl border-red-500/10">
                <div className="text-red-400 font-bold text-xl mb-2">CPU Waste</div>
                <p className="text-sm text-muted-foreground">Inefficient script execution drains mobile batteries and frustrates high-intent users.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl border-red-500/10">
                <div className="text-red-400 font-bold text-xl mb-2">Cart Loss</div>
                <p className="text-sm text-muted-foreground">Latency during checkout is the leading technical cause of abandoned transactions.</p>
              </div>
            </SectionRef>
          </div>
        </section>

        {/* CAPABILITIES SECTION */}
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 block">
                ✦ Precision Engineering
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Data-Driven <span className="text-gradient">Speed Architecture</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                We go beyond surface-level fixes. Our team analyzes your entire tech stack to implement architectural changes that ensure sustainable speed.
              </p>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Gauge className="w-6 h-6" />,
                  title: "Core Web Vitals",
                  desc: "Precision tuning of LCP, FID, and CLS metrics to exceed Google's 'Good' threshold."
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Edge Orchestration",
                  desc: "Global delivery strategies using Workers and Lambda@Edge for zero-latency compute."
                },
                {
                  icon: <FileCode2 className="w-6 h-6" />,
                  title: "Hydration Logic",
                  desc: "Optimizing React and Next.js hydration paths to prevent main-thread blocking."
                },
                {
                  icon: <Server className="w-6 h-6" />,
                  title: "Asset Pipeline",
                  desc: "Automated WebP/AVIF conversion, modern font compression, and strategic code-splitting."
                },
                {
                  icon: <Activity className="w-6 h-6" />,
                  title: "RUM Monitoring",
                  desc: "Real User Monitoring setup to track performance across actual devices and networks."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: "Script Governance",
                  desc: "Auditing and deferring third-party scripts that compromise the user experience."
                }
              ].map((feature, i) => (
                <motion.div key={i} variants={fadeUp} className="glass-card rounded-2xl p-7 group hover:border-primary/30 transition-all duration-300">
                  <div className="rounded-xl bg-primary/10 p-3.5 text-primary w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            
            <div className="mt-12 text-center">
              <Link to="/services" className="inline-flex items-center gap-2 text-primary font-heading font-semibold hover:gap-3 transition-all">
                Learn Our Methodology <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 block">
                  ✦ Targeted Solutions
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">
                  High-Stakes <span className="text-gradient">Performance</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  We solve complex performance challenges for high-traffic platforms where every millisecond translates directly to the bottom line.
                </p>
                <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <p className="italic text-foreground mb-6 relative z-10">
                    "FourIQ Tech reduced our Largest Contentful Paint by 62% for our global SaaS platform. The mobile conversion rates followed with a 24% increase immediately."
                  </p>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">CTO</div>
                    <div>
                      <div className="font-bold text-sm">Director of Engineering</div>
                      <div className="text-xs text-muted-foreground">Global Enterprise SaaS</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "Optimizing heavy React hydration for legacy apps",
                  "Reducing Time to First Byte (TTFB) on global API endpoints",
                  "Eliminating Layout Shift (CLS) on dynamic ad-driven sites",
                  "Implementing predictive prefetching for e-commerce",
                  "Streamlining third-party analytics and tracking pixels",
                  "Architecting sub-second mobile commerce experiences"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 block">
                ✦ The Workflow
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Our <span className="text-gradient">Performance</span> Framework
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Diagnostic Audit", desc: "In-depth profiling of network, CPU, and rendering bottlenecks." },
                { step: "02", title: "Strategic Roadmap", desc: "Prioritizing high-impact technical fixes with clear ROI metrics." },
                { step: "03", title: "Implementation", desc: "Expert code modifications across your entire technical stack." },
                { step: "04", title: "Validation", desc: "Continuous monitoring and iterative tuning for lasting results." }
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-2xl p-8 relative overflow-hidden group">
                  <span className="text-5xl font-display font-black text-primary/10 absolute -top-2 -right-2 group-hover:text-primary/20 transition-colors">
                    {item.step}
                  </span>
                  <h3 className="font-display text-xl font-bold mb-4 relative z-10">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 block">
                ✦ Common Questions
              </span>
              <h2 className="font-display text-4xl font-bold mb-4">Service <span className="text-gradient">FAQ</span></h2>
              <p className="text-muted-foreground">Technical answers for performance-driven organizations.</p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: "How do performance services impact SEO?",
                  a: "Google uses Core Web Vitals as a significant ranking factor. Faster sites provide a better user experience, leading to lower bounce rates and higher search engine visibility."
                },
                {
                  q: "What is the primary focus of your performance audit?",
                  a: "We analyze server response times, render-blocking resources, image optimization, and script execution to identify the most critical bottlenecks affecting your users."
                },
                {
                  q: "Do you optimize for mobile performance specifically?",
                  a: "Yes, we prioritize mobile-first performance, focusing on throttle-sensitive script execution and responsive image delivery to ensure parity across all devices."
                },
                {
                  q: "How long does it take to see results?",
                  a: "Technical improvements are immediate. SEO and conversion rate improvements typically materialize within weeks as search engines re-crawl your optimized pages."
                }
              ].map((faq, i) => (
                <details key={i} className="group glass-card rounded-2xl border border-white/5 overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-white/5 transition-colors">
                    <span className="font-heading font-semibold text-lg">{faq.q}</span>
                    <span className="bg-primary/10 text-primary p-1 rounded-lg group-open:rotate-180 transition-transform">
                      <Plus className="w-5 h-5 group-open:hidden" />
                      <div className="hidden group-open:block">—</div>
                    </span>
                  </summary>
                  <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-white/5 mt-0">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/[0.01] -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center">
            <SectionRef>
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-8">
                Ready to <span className="text-gradient">Accelerate</span> Your Growth?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Stop losing users to slow load times. Partner with FourIQ Tech to build a faster, more resilient digital experience today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/contact" className="bg-primary text-primary-foreground font-heading font-semibold px-10 py-5 rounded-xl glow-box flex items-center gap-2 group transition-all duration-300 w-full sm:w-auto">
                  Schedule Your Consultation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/services/web-design-development" className="text-foreground font-heading font-semibold flex items-center gap-2 hover:text-primary transition-colors">
                  View Development Services <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </SectionRef>
          </div>
        </section>

        {/* INTERNAL LINKS (MINIMAL) */}
        <section className="py-12 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Related:</span>
              <Link to="/services/web-design-development" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">Web Design & Development</Link>
              <Link to="/services/seo-services" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">SEO Optimization</Link>
              <Link to="/services/custom-web-applications" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">Custom Web Applications</Link>
              <Link to="/blog/react-multi-tenant-saas-architecture-performance" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">Performance Blog</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}