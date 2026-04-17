import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
import { AlertTriangle, Clock, ShieldAlert, Code2, Server, Users, ArrowUpRight, CheckCircle2, Zap, BarChart3, ChevronDown } from 'lucide-react';

export default function EnterpriseReactNextjsConsulting() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const SectionAnimation = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      <SEO 
        title="Enterprise React & Next.js Consulting Services | FouriqTech" 
        description="Scale your web infrastructure with expert enterprise React and Next.js consulting services. High-performance architecture for global businesses." 
        url="https://fouriqtech.com/services/enterprise-react-nextjs-consulting"
      />
      <Navbar isVisible={navVisible} />

      <main className="pt-32">
        {/* Hero Section */}
        <section className="relative py-24 px-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-8">
                High-Performance <span className="text-gradient">Enterprise React and Next.js Consulting Services</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                We empower CTOs and technical leaders to build resilient, scalable web applications. Accelerate your development cycle with our elite engineering team.
              </p>
              <div className="flex flex-col items-center gap-4">
                <a href="/#contact">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box flex items-center gap-2">
                    Schedule Architectural Review <ArrowUpRight size={18} />
                  </motion.button>
                </a>
                <span className="text-sm text-muted-foreground font-heading">✦ Trusted by 50+ enterprise teams worldwide</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionAnimation>
              <h2 className="font-display text-4xl font-bold mb-16 text-center">Technical Bottlenecks Holding You Back</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[ 
                  { icon: AlertTriangle, title: "Scaling Complexity", desc: "Your current frontend struggles under enterprise-level traffic." },
                  { icon: Clock, title: "Slow Time-to-Market", desc: "Dev teams bogged down by technical debt rather than shipping." },
                  { icon: ShieldAlert, title: "Security & Architecture", desc: "Lack of a robust foundation leading to performance gaps." }
                ].map((item, i) => (
                  <div key={i} className="glass-card p-8 rounded-3xl border border-border bg-muted/30">
                    <item.icon size={40} className="text-primary mb-6" />
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </SectionAnimation>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-24 px-6 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <SectionAnimation>
              <h2 className="font-display text-4xl font-bold mb-16">Engineering Excellence as a Service</h2>
              <div className="grid lg:grid-cols-3 gap-8">
                {[ 
                  { icon: Code2, title: "React Architecture", desc: "We optimize your component tree and state management." },
                  { icon: Server, title: "Next.js Enterprise", desc: "Leveraging Server Components and SSR for speed." },
                  { icon: Users, title: "Dedicated Experts", desc: "Consultants who integrate directly into your sprint cycles." }
                ].map((item, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10">
                    <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-primary mb-8">
                      <item.icon size={38} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </SectionAnimation>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto glass p-16 rounded-3xl text-center border-primary/20">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Ready to Architect the Future of Your Web App?</h2>
            <p className="text-lg text-muted-foreground mb-10">Don't settle for average performance. Let our experts optimize your digital infrastructure for enterprise growth.</p>
            <a href="/#contact">
              <motion.button whileHover={{ scale: 1.05 }} className="py-4 px-10 bg-primary text-primary-foreground font-heading font-semibold rounded-xl">
                Book Your Architectural Strategy Session
              </motion.button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}