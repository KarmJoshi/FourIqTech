import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Layers, Shield, Zap, Globe2, GitBranch,
  BarChart3, Lock, Cpu, Users, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function EnterpriseNextjsDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);
  }, [setScrollLocked]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const capabilities = [
    { icon: Layers, title: 'App Router Architecture', desc: 'Server Components, streaming SSR, and parallel routes for instant page loads and seamless navigation.' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control, CSRF protection, rate limiting, and SOC 2 compliant infrastructure patterns.' },
    { icon: Zap, title: 'Edge-First Performance', desc: 'ISR, edge middleware, and global CDN deployment delivering sub-200ms TTFB worldwide.' },
    { icon: Globe2, title: 'Multi-Region Deployment', desc: 'Geo-distributed infrastructure with automatic failover, ensuring 99.99% uptime for global teams.' },
    { icon: GitBranch, title: 'CI/CD Pipelines', desc: 'Automated testing, preview deployments, and trunk-based development workflows for rapid iteration.' },
    { icon: BarChart3, title: 'Observability Stack', desc: 'Real-time error tracking, performance monitoring, and custom dashboards for data-driven decisions.' },
  ];

  const results = [
    { metric: '< 200ms', label: 'Time to First Byte', detail: 'Edge-cached globally' },
    { metric: '99.99%', label: 'Uptime SLA', detail: 'Multi-region redundancy' },
    { metric: '95+', label: 'Lighthouse Score', detail: 'Performance & accessibility' },
    { metric: '3x', label: 'Faster Iteration', detail: 'vs traditional monoliths' },
  ];

  const process = [
    { step: '01', title: 'Architecture Discovery', desc: 'We audit your existing systems, map data flows, and define the ideal Next.js architecture for your scale.' },
    { step: '02', title: 'Foundation Sprint', desc: 'Build the core — authentication, API layer, design system, and CI/CD in a focused 2-week sprint.' },
    { step: '03', title: 'Feature Development', desc: 'Iterative 2-week sprints delivering production-ready features with automated testing and review gates.' },
    { step: '04', title: 'Launch & Scale', desc: 'Zero-downtime deployment, performance benchmarking, and post-launch monitoring to ensure stability.' },
  ];

  const useCases = [
    'SaaS platforms with complex dashboards',
    'Multi-tenant B2B applications',
    'High-traffic content platforms',
    'Internal enterprise tools',
    'E-commerce with headless CMS',
    'Real-time collaboration apps',
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Enterprise Next.js Development",
    "description": "Production-grade Next.js applications for enterprise teams. Server Components, edge deployment, and scalable architecture.",
    "provider": { "@type": "Organization", "name": "FourIQ Tech", "url": "https://fouriqtech.com" },
    "url": "https://fouriqtech.com/services/enterprise-nextjs-development",
    "serviceType": "Enterprise Web Application Development"
  };

  const SectionRef = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
      <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUp} className={className}>
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO
        title="Enterprise Next.js Development Company"
        description="Production-grade Next.js applications for enterprise teams. Server Components, edge deployment, multi-tenant architecture, and 99.99% uptime SLA."
        url="https://fouriqtech.com/services/enterprise-nextjs-development"
        schema={serviceSchema}
      />
      <Navbar isVisible={navVisible} />

      <main className="flex-1 w-full">
        {/* ═══ HERO ═══ */}
        <section className="relative pt-36 pb-24 px-6 lg:px-12 overflow-hidden border-b border-white/5">
          <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] inline-block mb-5">
                ✦ Enterprise Next.js Development
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05]">
                Next.js Applications <br className="hidden md:block" />
                <span className="text-gradient">Built for Enterprise Scale</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                We build production-grade Next.js applications that handle millions of users, integrate with your existing infrastructure, and ship faster than internal teams.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 50px hsl(42 85% 55% / 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-2"
                  >
                    Discuss Your Project <ArrowUpRight size={18} />
                  </motion.button>
                </Link>
                <Link to="/services" className="py-4 px-8 border border-white/10 text-foreground/80 font-heading font-medium rounded-xl hover:border-white/20 hover:bg-white/[0.02] transition-all inline-flex items-center gap-2">
                  All Services <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ RESULTS BAR ═══ */}
        <section className="border-b border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <SectionRef>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {results.map((r, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <p className="font-display text-3xl md:text-4xl font-bold text-gradient">{r.metric}</p>
                    <p className="text-foreground/80 text-sm font-medium mt-1">{r.label}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{r.detail}</p>
                  </div>
                ))}
              </div>
            </SectionRef>
          </div>
        </section>

        {/* ═══ CAPABILITIES ═══ */}
        <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <SectionRef className="text-center mb-16">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Technical Excellence</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">Enterprise-Grade <span className="text-gradient">Capabilities</span></h2>
              <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">Every decision is optimized for performance, security, and maintainability at scale.</p>
            </SectionRef>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.div key={i} variants={fadeUp} className="glass-card rounded-2xl p-7 hover:border-primary/20 transition-all duration-300 group">
                    <div className="inline-flex rounded-xl bg-primary/10 p-3.5 text-primary mb-5 group-hover:bg-primary/15 transition-colors">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2">{cap.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{cap.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══ USE CASES ═══ */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <SectionRef>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Ideal For</span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">Built for <span className="text-gradient">Complex Problems</span></h2>
                  <p className="text-muted-foreground text-base leading-relaxed mb-8">
                    We don't build brochure sites. Our Next.js practice focuses on applications that need to handle real complexity — multi-tenant data isolation, real-time features, and enterprise integrations.
                  </p>
                  <Link to="/contact" className="text-primary font-heading font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
                    Tell us about your project <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {useCases.map((uc, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 transition-colors">
                      <CheckCircle2 size={18} className="text-primary shrink-0" />
                      <span className="text-foreground/80 text-sm font-medium">{uc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionRef>
          </div>
        </section>

        {/* ═══ PROCESS ═══ */}
        <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <SectionRef className="text-center mb-16">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Our Process</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">From Discovery to <span className="text-gradient">Production</span></h2>
            </SectionRef>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((p, i) => (
                <motion.div key={i} variants={fadeUp} className="relative glass-card rounded-2xl p-7">
                  <span className="font-display text-5xl font-bold text-primary/10 absolute top-4 right-5">{p.step}</span>
                  <h3 className="font-display text-lg font-bold mb-3 mt-2">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ WHY US ═══ */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <SectionRef>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  {[
                    { icon: Lock, title: 'Security First', desc: 'We design for compliance from day one — not as an afterthought. OWASP best practices baked into every layer.' },
                    { icon: Cpu, title: 'Performance Obsessed', desc: 'Every millisecond counts. We measure, optimize, and monitor to keep your app at peak performance.' },
                    { icon: Users, title: 'Team Augmentation', desc: 'We integrate with your existing engineering team, following your processes and contributing from day one.' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-5">
                        <div className="shrink-0 inline-flex rounded-xl bg-primary/10 p-3 h-fit text-primary">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold mb-1">{item.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="glass-card rounded-2xl p-8 border-primary/10">
                  <h3 className="font-display text-2xl font-bold mb-4">Why Teams Choose Us</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    We've shipped Next.js applications handling 100K+ concurrent users, processing millions of API requests daily, with zero unplanned downtime.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our developers are experts in React Server Components, the App Router, and modern deployment infrastructure. We don't just write code — we architect systems that your team can maintain and extend for years.
                  </p>
                </div>
              </div>
            </SectionRef>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-28 px-6 lg:px-12 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-primary/[0.02]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <SectionRef>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Ready to Scale with <span className="text-gradient">Next.js?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                Let's architect a solution that fits your team, your timeline, and your scale requirements.
              </p>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-2"
                >
                  Start a Conversation <ArrowUpRight size={18} />
                </motion.button>
              </Link>
            </SectionRef>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
