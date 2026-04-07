import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
import { ZapOff, Database, Unplug, Target, TrendingUp, Globe, ArrowUpRight, ChevronDown, CheckCircle2, Cpu, Zap, Layers } from 'lucide-react';

export default function EnterpriseRevenueAcceleration() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO 
        title="Enterprise Revenue Acceleration Services | FouriqTech" 
        description="Scale your B2B growth with data-driven enterprise revenue acceleration services. Strategic consulting and digital growth solutions for global enterprises."
        url="https://fouriqtech.com/services/enterprise-revenue-acceleration"
      />
      <Navbar isVisible={navVisible} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-44 pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] liquid-blob" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] liquid-blob animate-pulse" />
          </div>

          <div className="max-w-7xl mx-auto text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary text-sm font-heading font-medium uppercase tracking-[0.3em] block mb-6"
            >
              ✦ Enterprise Excellence
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8"
            >
              Scale Your Market <br /> Dominance with <span className="text-gradient">Enterprise Revenue Acceleration</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12"
            >
              We bridge the gap between marketing spend and bottom-line profit. Leverage our B2B growth strategy consulting and high-performance digital infrastructure to secure sustainable, strategic revenue growth.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.95 }}
                className="py-4 px-10 bg-primary text-primary-foreground font-heading font-bold rounded-full glow-box flex items-center gap-3 text-lg"
              >
                Request a Revenue Audit <ArrowUpRight size={20} />
              </motion.button>
              <span className="text-muted-foreground font-heading text-sm uppercase tracking-widest">
                Trusted by Fortune 500 Enterprises Globally
              </span>
            </motion.div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-32 px-6 bg-[#030303]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ The Challenge
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
                The Hidden Leaks in Your <span className="text-gradient">Growth Engine</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[ 
                {
                  icon: ZapOff,
                  title: "Stagnant Sales Pipelines",
                  desc: "Enterprise sales cycles are getting longer and more complex, leaving your revenue targets at risk due to inefficient lead nurturing."
                },
                {
                  icon: Database,
                  title: "Fragmented Data Silos",
                  desc: "Without a unified view of your customer journey, you're flying blind, unable to attribute which channels actually drive enterprise-level ROI."
                },
                {
                  icon: Unplug,
                  title: "Outdated Digital Assets",
                  desc: "A slow, legacy web presence creates friction for modern B2B buyers, killing your credibility before the first sales call even happens."
                }
              ].map((problem, i) => (
                <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500">
                  <div className="mb-6 p-4 rounded-2xl bg-primary/10 text-primary w-fit group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                    <problem.icon size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-7xl mx-auto">
            <div className="text-right mb-20">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ Our Framework
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 text-white">
                Exponential <span className="text-gradient">B2B Growth</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {[ 
                {
                  icon: Target,
                  title: "Enterprise Sales Pipeline Optimization",
                  desc: "We re-engineer your funnel with automated lead scoring and high-intent conversion paths to ensure your sales team only talks to qualified buyers."
                },
                {
                  icon: TrendingUp,
                  title: "B2B Growth Strategy Consulting",
                  desc: "A data-first approach to market expansion, identifying high-yield opportunities and optimizing your go-to-market execution for maximum velocity."
                },
                {
                  icon: Globe,
                  title: "Digital Growth Solutions for Enterprises",
                  desc: "From bespoke React-based platforms to SEO authority building, we build the digital infrastructure required to support 8 and 9-figure annual revenues."
                }
              ].map((sol, i) => (
                <div key={i} className="glass-card p-10 relative group">
                  <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                    <sol.icon size={38} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                    {sol.title}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {sol.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-32 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="font-display text-4xl md:text-5xl font-bold">The Road to <span className="text-gradient">Accelerated Revenue</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[ 
                { step: "01", title: "Revenue Gap Analysis", desc: "Deep dive into sales velocity and tech stack to identify immediate ROI opportunities." },
                { step: "02", title: "Strategic Blueprinting", desc: "Designing a roadmap to align sales and marketing under a single source of truth." },
                { step: "03", title: "High-Performance Deployment", desc: "Building premium UI/UX and growth systems with Next.js and CRM integration." },
                { step: "04", title: "Velocity Scaling", desc: "Continuous multivariate testing to ensure consistent growth regardless of market shifts." }
              ].map((item, idx) => (
                <div key={idx} className="relative p-8 rounded-2xl border border-white/5 bg-background/50 hover:border-primary/30 transition-all group">
                  <span className="text-5xl font-display font-black text-white/5 absolute top-4 right-6 group-hover:text-primary/10 transition-colors">{item.step}</span>
                  <h4 className="font-heading font-bold text-xl mb-4 text-primary">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <span className="text-primary text-xs font-heading font-medium uppercase tracking-[0.4em] mb-12">
              ✦ Built on an Elite Tech Foundation
            </span>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              {['React', 'Next.js', 'TypeScript', 'HubSpot', 'Salesforce', 'GA4', 'GSAP', 'Vite'].map((tech) => (
                <span key={tech} className="text-2xl font-heading font-bold hover:text-primary transition-colors cursor-default">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-32 px-6 border-y border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            {[ 
              { val: "42%", lbl: "Increase in Pipeline Velocity" },
              { val: "$250M+", lbl: "Client Revenue Generated" },
              { val: "150+", lbl: "Enterprise Integrations" },
              { val: "Top 1%", lbl: "Global Agency Ranking" }
            ].map((metric, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-6xl font-display font-bold text-gradient mb-2">{metric.val}</div>
                <div className="text-muted-foreground font-heading text-xs uppercase tracking-widest">{metric.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">Expert <span className="text-gradient">Insights</span></h2>
            <div className="space-y-4">
              {[ 
                {
                  q: "What exactly are enterprise revenue acceleration services?",
                  a: "These services combine high-end digital marketing, sales tech-stack optimization, and strategic consulting to shorten sales cycles and increase the average deal size for large-scale organizations."
                },
                {
                  q: "How does B2B growth strategy consulting differ from traditional marketing?",
                  a: "Traditional marketing focuses on traffic and leads; our consulting focuses on the entire revenue lifecycle, ensuring that digital growth solutions for enterprises actually convert into bottom-line profit."
                },
                {
                  q: "Can you integrate with our existing CRM (Salesforce/HubSpot)?",
                  a: "Yes. We specialize in enterprise sales pipeline optimization that creates seamless data flow between your high-performance web applications and your core sales tools."
                },
                {
                  q: "What is the typical timeframe for seeing measurable results?",
                  a: "While foundational infrastructure takes 4-8 weeks to deploy, most enterprise clients see measurable improvements in lead quality and pipeline visibility within the first 90 days."
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-white/10">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full py-6 flex justify-between items-center text-left"
                  >
                    <span className="font-heading text-lg font-medium">{faq.q}</span>
                    <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 text-muted-foreground leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-40 px-6 relative">
          <div className="max-w-5xl mx-auto glass-modern p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -z-10" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
            
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-8">Stop Guessing.<br /><span className="text-gradient">Start Growing.</span></h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Book a discovery call with our architects to see how we can accelerate your enterprise revenue. Limited capacity for new Q3 partnerships.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-5 px-12 bg-primary text-primary-foreground font-heading font-bold rounded-2xl text-xl glow-box flex items-center gap-3 mx-auto"
            >
              Secure Your Strategic Audit <ArrowUpRight size={24} />
            </motion.button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
