import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
import { 
  ZapOff, 
  Layers, 
  BarChart3, 
  AlertCircle, 
  SearchCode, 
  Cpu, 
  Network, 
  Terminal, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronDown, 
  Activity, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

export default function EnterpriseReactPerformanceOptimization() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const fadeIn = { 
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO 
        title="Enterprise React Performance Optimization Services | FouriqTech" 
        description="Elite React and Next.js performance consulting for enterprises. We eliminate technical debt, optimize Core Web Vitals, and scale web applications." 
        url="https://fouriqtech.com/services/enterprise-react-performance-optimization" 
      />
      <Navbar isVisible={navVisible} />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.04] rounded-full blur-[150px] liquid-blob pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] mb-6 inline-block"
            >
              ✦ Enterprise Scalability Solutions
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-bold leading-tight mb-8"
            >
              Scale Without Limits: Elite <br />
              <span className="text-gradient">Enterprise React Performance Optimization</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Stop losing revenue to high latency and architectural bloat. We specialize in transforming sluggish enterprise applications into high-velocity engines that dominate Core Web Vitals and scale seamlessly.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.a
                href="/#contact"
                whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="py-4 px-10 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 flex items-center gap-2 text-lg"
              >
                Schedule a Technical Audit <ArrowUpRight size={20} />
              </motion.a>
              <span className="text-muted-foreground text-sm font-heading uppercase tracking-widest">
                Trusted by CTOs at Mid-Market and Enterprise firms globally
              </span>
            </motion.div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ The Challenge
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
                The Hidden Cost of <span className="text-gradient">Technical Debt</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[ 
                {
                  icon: ZapOff,
                  title: "Degrading Core Web Vitals",
                  description: "Poor LCP and CLS scores are damaging your search rankings and user retention. We provide Next.js core web vitals consulting to reverse the slide."
                },
                {
                  icon: Layers,
                  title: "Stagnant Legacy Architectures",
                  description: "Legacy react code debt reduction is critical for teams unable to ship new features due to fragile, unoptimized codebases."
                },
                {
                  icon: BarChart3,
                  title: "Scaling Bottlenecks",
                  description: "As user loads increase, your application logic fails. Our web application scalability consulting identifies and removes compute-heavy bottlenecks."
                },
                {
                  icon: AlertCircle,
                  title: "Untraceable Memory Leaks",
                  description: "Ghost bugs and re-render loops are draining your team's productivity. We provide deep-dive enterprise react troubleshooting to stabilize your stack."
                }
              ].map((item, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 transition-[border-color,transform] duration-500 hover:border-primary/45">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                      <item.icon size={38} strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-8 font-display text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="relative py-32 px-6 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-right">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ Our Approach
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
                High-Performance <span className="text-gradient">Engineering Solutions</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[ 
                {
                  icon: SearchCode,
                  title: "React Application Performance Audit",
                  description: "A comprehensive 50-point inspection of your bundle size, dependency tree, and render cycles using Chrome DevTools and custom profiling."
                },
                {
                  icon: Cpu,
                  title: "Next.js & SSR Optimization",
                  description: "Expert tuning of Incremental Static Regeneration (ISR) and Server-Side Rendering (SSR) to ensure sub-second Time to Interactive (TTI)."
                },
                {
                  icon: Network,
                  title: "Scalable State Management",
                  description: "Redesigning complex state logic (Zustand, Redux, or Context) to prevent unnecessary top-down re-renders in enterprise environments."
                },
                {
                  icon: Terminal,
                  title: "Codebase Refactoring",
                  description: "Systematic removal of technical debt and modernization of your CI/CD pipelines to ensure long-term performance stability."
                }
              ].map((item, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 transition-[border-color,transform] duration-500 hover:border-primary/45">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                      <item.icon size={38} strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-8 font-display text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ Methodology
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
                Our 4-Step <span className="text-gradient">Optimization Framework</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 hidden md:block" />
              <div className="space-y-24">
                {[ 
                  {
                    step: 1,
                    title: "Deep Discovery & Profiling",
                    description: "We perform a forensic React application performance audit to map out bottlenecks and prioritize ROI-driven fixes."
                  },
                  {
                    step: 2,
                    title: "Architectural Roadmap",
                    description: "We deliver a detailed technical blueprint for enterprise react troubleshooting and scalability improvements."
                  },
                  {
                    step: 3,
                    title: "Precision Execution",
                    description: "Our senior engineers implement refactors, optimize tree-shaking, and address legacy react code debt reduction without service interruption."
                  },
                  {
                    step: 4,
                    title: "Performance Sustenance",
                    description: "We set up automated performance monitoring and Core Web Vitals guardrails to ensure your application stays fast forever."
                  }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="flex-1 text-left md:text-right">
                      {idx % 2 === 0 ? (
                        <>
                          <h4 className="font-display text-2xl font-bold text-foreground mb-4">{item.title}</h4>
                          <p className="text-muted-foreground">{item.description}</p>
                        </>
                      ) : null}
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display text-2xl font-bold z-10 relative">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      {idx % 2 !== 0 ? (
                        <>
                          <h4 className="font-display text-2xl font-bold text-foreground mb-4">{item.title}</h4>
                          <p className="text-muted-foreground">{item.description}</p>
                        </>
                      ) : (
                         <div className="hidden md:block" />
                      )}
                      {idx % 2 === 0 && <div className="md:hidden">
                        <h4 className="font-display text-2xl font-bold text-foreground mb-4">{item.title}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="relative py-24 px-6 border-y border-white/5 bg-muted/10">
          <div className="max-w-7xl mx-auto text-center">
             <span className="text-primary text-xs font-heading font-medium uppercase tracking-[0.2em] mb-12 inline-block">
              ✦ Tools of the Trade
            </span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {['React 18+', 'Next.js', 'TypeScript', 'Vite', 'Turborepo', 'GSAP', 'Framer Motion', 'Tailwind CSS', 'Playwright'].map((tech) => (
                <div key={tech} className="px-6 py-3 rounded-full border border-white/10 bg-white/5 font-heading text-lg font-medium text-foreground">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Metrics */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { value: "40%", label: "Avg. LCP Improvement" },
                { value: "50+", label: "Enterprise Audits" },
                { value: "$25k+", label: "Min. Project Depth" },
                { value: "99.9%", label: "Uptime Maintained" }
              ].map((metric, idx) => (
                <div key={idx} className="text-center">
                  <div className="font-display text-5xl md:text-6xl font-bold text-gradient mb-4">{metric.value}</div>
                  <div className="font-heading text-muted-foreground uppercase tracking-widest text-sm">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-20 text-center">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ Common Inquiries
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">Performance <span className="text-gradient">FAQ</span></h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "What is included in a React application performance audit?",
                  answer: "We analyze bundle composition, tree-shaking efficiency, memoization patterns, API response handling, and real-world Core Web Vitals metrics across devices."
                },
                {
                  question: "Can you handle legacy React codebases from 5+ years ago?",
                  answer: "Yes. Legacy react code debt reduction is one of our core specialties. We help modernize Class-based components and outdated state patterns into high-performing functional hooks."
                },
                {
                  question: "How long does a typical optimization project take?",
                  answer: "Enterprise engagements typically range from 4 to 12 weeks, depending on the complexity of the architectural technical debt."
                },
                {
                  question: "Do you provide Next.js specific consulting?",
                  answer: "Absolutely. Our Next.js core web vitals consulting focuses on data fetching strategies, image optimization, and middleware performance."
                }
              ].map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-heading font-semibold text-lg">{faq.question}</span>
                    <ChevronDown size={20} className={`text-primary transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-muted-foreground leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-40 px-6">
          <div className="absolute inset-0 bg-primary/[0.02] liquid-blob pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-8">
              Reclaim Your Application's <br />
              <span className="text-gradient">Competitive Edge</span>
            </h2>
            <p className="text-muted-foreground text-xl mb-12">
              Technical debt is a compound interest on your growth. Secure your technical audit today and stop leaving performance on the table. Projects start at $25,000.
            </p>
            <motion.a
              href="/#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex py-4 px-12 bg-primary text-primary-foreground font-heading font-bold rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300 text-lg"
            >
              Request a Technical Consultation
            </motion.a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}