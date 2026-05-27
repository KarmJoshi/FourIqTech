import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Shield, Target, Eye, Users, ChevronRight, Check, Cpu, Bot, Activity, HeartHandshake } from 'lucide-react';

export default function About() {
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

  const HeroSection = () => {
    return (
      <section className="relative pt-36 pb-20 px-6 lg:px-12 overflow-hidden border-b border-white/5">
        <div className="absolute top-20 right-[15%] w-[450px] h-[450px] bg-primary/[0.04] rounded-full blur-[130px] liquid-blob pointer-events-none" />
        <div className="absolute top-40 left-[10%] w-[350px] h-[350px] bg-accent/[0.03] rounded-full blur-[110px] liquid-blob-2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant}>
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] inline-block mb-4">
              ✦ About Four IQ Tech
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
              Pioneering the Next Era of <span className="text-gradient">Digital Intelligence & Design</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
              We are a team of visionary architects, engineers, and designers dedicated to building high-performance digital engines that scale organizations globally.
            </p>
          </motion.div>
        </div>
      </section>
    );
  };

  const StorySection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            ref={ref}
            initial="hidden" 
            animate={isInView ? "visible" : "hidden"} 
            variants={fadeUpVariant}
            className="space-y-6"
          >
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Our Story</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              How We Became <span className="text-gradient">FouriqTech</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Founded on the belief that traditional software development processes are sluggish and disconnected, FouriqTech was built to bridge the gap between design excellence and industrial-grade software engineering.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We eliminate technical debt by establishing solid design tokens and scalable backend architectures from day one. Over the years, we have transitioned from a localized studio to an internationally respected, remote-first technology partner, empowering startups and enterprises worldwide with products that yield high engagement, fast loading times, and direct ROI.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="text-primary" size={16} />
                <span className="text-sm font-semibold">Remote-First Culture</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="text-primary" size={16} />
                <span className="text-sm font-semibold">50+ Projects Delivered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <Check className="text-primary" size={16} />
                <span className="text-sm font-semibold">99.9% Architecture Uptime</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-[30px] liquid-blob" />
              
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-bold text-gradient">Our Core Pillars</h3>
                <div className="space-y-4">
                  {[
                    { title: "Empirical Design", desc: "No subjective choices. Every micro-animation, color palette, and layout structure serves directly to optimize user engagement and speed." },
                    { title: "Engineering Hegemony", desc: "Our code bases utilize modern tech stacks (React, Next.js, Postgres) structured elegantly with zero redundancies." },
                    { title: "Absolute Transparency", desc: "Clients retain full accessibility. Strategic pipelines are visible, keeping deliverables crystal clear and communication continuous." }
                  ].map((pillar, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <span className="font-bold text-xs">{i+1}</span>
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground text-sm">{pillar.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{pillar.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  const MissionSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const icons = { Target, Eye, Users };

    const sections = [
      { icon: "Target", title: "Our Mission", description: "To elevate global business digital standards by delivering custom products that combine maximum execution speed, beautiful responsive designs, and robust architecture." },
      { icon: "Eye", title: "Our Vision", description: "To become the premier global benchmark for bespoke web design and SaaS platforms, proving that highly dynamic aesthetics and absolute efficiency can coexist flawlessly." },
      { icon: "Users", title: "Our Partnership", description: "We construct relationships built to scale. We act as an integrated technical department, aligning our strategies directly with client long-term financial growth." }
    ];

    return (
      <section className="py-24 px-6 lg:px-12 bg-black/40 border-y border-white/5 relative">
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/[0.02] rounded-full blur-[90px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {sections.map((sec, i) => {
              const Icon = icons[sec.icon as keyof typeof icons] || Target;
              return (
                <motion.div key={i} variants={fadeUpVariant} className="glass-card rounded-3xl p-8 hover:border-primary/30 transition-all duration-300">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-4 text-primary mb-6">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">{sec.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{sec.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  const AgentShowcaseSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-[10%] w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[130px] liquid-blob pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              ref={ref}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUpVariant}
              className="lg:col-span-6 space-y-6"
            >
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] flex items-center gap-2">
                <Cpu size={16} className="animate-spin-slow text-primary" /> Autonomous Operations
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                Living Proof: <br /><span className="text-gradient">Managed & Optimized by AI</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                FouriqTech eats its own dog food. This entire website, its SEO research, keyword targeting, blog insights, and technical optimization are autonomously managed by our proprietary <strong className="text-foreground font-semibold">Autonomous SEO Agent</strong>.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                By integrating a smart multi-agent hierarchy running 24/7, our platform requires <strong className="text-foreground font-semibold">zero human management</strong>. We prove that autonomous AI-led content strategy and development pipelines produce flawless design, high-speed architectures, and solid organic ranking growth.
              </p>
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/[0.03] flex items-start gap-4">
                <Activity size={24} className="text-primary mt-1 shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-heading font-bold text-sm text-foreground">Active Daily Routine</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every 24 hours, our Agency Director scans Google Search Console, compiles playbooks, writes case studies, and deploys code patches automatically.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Dashboard Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-6"
            >
              <div className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    </div>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">FOURIQTECH SEO ENGINE // LIVE STATUS</span>
                  </div>
                  <span className="text-[10px] font-heading font-semibold uppercase tracking-wider px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                    Optimized
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs text-muted-foreground">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-primary font-bold">▶ [Market Intelligence]</span> Competitor Gap Analysis completed.
                    <p className="text-[11px] text-zinc-500 mt-1 pl-4">Discovered high-intent buyer keyword opportunity: "Enterprise Headless Commerce".</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-primary font-bold">▶ [Autonomous Copywriting]</span> Premium industry guide published.
                    <p className="text-[11px] text-zinc-500 mt-1 pl-4">Created 1,200-word structured case study with optimized metadata schema.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-primary font-bold">▶ [Conversion Engineering]</span> Layout alignment inspected.
                    <p className="text-[11px] text-zinc-500 mt-1 pl-4">Refined landing CTA routes to boost organic visitor conversion rates.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-primary font-bold">▶ [Speed & Performance]</span> Core Web Vitals audit completed.
                    <p className="text-[11px] text-zinc-500 mt-1 pl-4">Lighthouse Score: 100/100. Load speed: 0.4s. All assets compressed successfully.</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-4">
                  <span>PROPRIETARY MULTI-AGENT SYSTEM</span>
                  <span className="text-primary">100% AUTOMATED MARKETING</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const TeamSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const team = [
      { name: "Karm Joshi", role: "AI and Automation", init: "KJ" },
      { name: "Kathan Patel", role: "WordPress", init: "KP" },
      { name: "Satyam Pandey", role: "Full Stack Developer", init: "SP" },
      { name: "Hitarth Joshi", role: "Full Stack Developer", init: "HJ" }
    ];

    return (
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Our Leaders</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">The Minds Behind <span className="text-gradient">The Intelligence</span></h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="group glass-card rounded-3xl p-6 relative overflow-hidden text-center hover:scale-[1.02] duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                
                <div className="w-24 h-24 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center font-display text-3xl font-bold text-primary mx-auto mb-6 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all shadow-inner">
                  {member.init}
                </div>

                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</h3>
                <p className="text-xs text-muted-foreground font-heading uppercase tracking-widest mt-1">{member.role}</p>

                <div className="mt-4 flex justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold text-primary/80">✦ Expert</span>
                  <span className="text-xs font-semibold text-muted-foreground">• Remote</span>
                </div>
              </motion.div>
            ))}
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
              Let's Co-create Your <span className="text-gradient">Next Technical Breakthrough</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Get in touch with FouriqTech's strategists to map out a design layout, software architecture, and roadmap configured explicitly for your company's expansion.
            </p>
            <a href="/contact">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-2"
              >
                Get Started Today <ArrowUpRight size={18} />
              </motion.button>
            </a>
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO 
        title="About Us | FouriqTech - Global Web Design & SaaS Agency" 
        description="Discover FouriqTech's story, mission, and the global leadership team of expert software engineers and UI/UX designers building high-performance web solutions." 
        url="https://fouriqtech.com/about" 
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full">
        <HeroSection />
        <StorySection />
        <MissionSection />
        <AgentShowcaseSection />
        <TeamSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
