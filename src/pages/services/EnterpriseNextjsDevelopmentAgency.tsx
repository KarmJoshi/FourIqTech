import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
import { 
  AlertTriangle, 
  Gauge, 
  ShieldAlert, 
  Globe, 
  ArrowRightLeft, 
  Code2, 
  ArrowUpRight,
  CheckCircle2,
  Server
} from 'lucide-react';

export default function EnterpriseNextjsDevelopmentAgency() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32 selection:bg-primary/30">
      <SEO 
        title="Enterprise Next.js Development Agency | Custom Web Scaling Experts" 
        description="FouriqTech provides premium enterprise Next.js development. Expert custom web app solutions, migrations, and architecture for high-growth global businesses." 
        url="https://fouriqtech.com/services/enterprise-nextjs-development-agency" 
      />
      
      <Navbar isVisible={navVisible} />

      <main className="flex-1 w-full overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-24 px-6 lg:py-32">
          <div className="absolute top-0 right-0 -mr-20 h-[600px] w-[600px] bg-primary/[0.03] rounded-full blur-[120px] liquid-blob" />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-8">
                High-Performance Enterprise Next.js <br />
                <span className="text-gradient">Development Agency for Global Scaling</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                We engineer robust, high-traffic web applications using modern, scalable architectures. Partner with the industry-leading team for your next-generation digital transformation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="/#contact">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all flex items-center gap-2">
                    Request Engineering Audit <ArrowUpRight size={18} />
                  </motion.button>
                </a>
              </div>
              <p className="mt-8 text-sm text-muted-foreground/60 font-heading tracking-widest uppercase">
                Trusted by 50+ enterprise leaders across North America, UK, and MENA.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">Technical Debt is Stalling Your Growth</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: AlertTriangle, title: "Stagnant Legacy Infrastructure", desc: "Outdated frameworks lead to slow performance, security vulnerabilities, and an inability to adapt to modern user expectations." },
                { icon: Gauge, title: "Performance Bottlenecks", desc: "High latency and poor Core Web Vitals are directly impacting your conversion rates and enterprise-level SEO rankings." },
                { icon: ShieldAlert, title: "Security & Compliance Risks", desc: "Operating on insecure, unmaintained environments risks data integrity and fails to meet critical global enterprise security standards." }
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 rounded-3xl border border-white/5">
                  <item.icon className="text-primary mb-6" size={40} />
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-16 text-center">Engineered for <span className="text-gradient">Enterprise Success</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Globe, title: "Scalable Next.js Architecture", desc: "As enterprise Next.js architecture experts, we build modular, SSR/ISR-enabled applications that scale effortlessly under high-concurrency loads." },
                { icon: ArrowRightLeft, title: "Seamless Next.js Migration", desc: "Our specialized Next.js migration agency process ensures zero downtime and data integrity while moving your legacy stack to a high-performance modern environment." },
                { icon: Code2, title: "Custom React Consulting", desc: "We offer high-touch React and Next.js consulting services designed to optimize your development velocity and code quality." }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 transition-all hover:border-primary/45">
                  <item.icon className="text-primary mb-8" size={48} strokeWidth={1.5} />
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 bg-[#080808]">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-20">Our Precision Delivery Framework</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Discovery & Strategy", desc: "We audit your existing constraints and map out the architectural requirements." },
                { step: "02", title: "UX & System Design", desc: "High-fidelity interfaces that prioritize accessibility and intuitive journeys." },
                { step: "03", title: "Agile Build Phase", desc: "Iterative development cycles leveraging TypeScript and clean, modular patterns." },
                { step: "04", title: "Deployment & Optimization", desc: "Ongoing performance tuning to ensure best-in-class results." }
              ].map((s, i) => (
                <div key={i} className="relative pt-8 border-t border-primary/20">
                  <div className="text-primary font-heading font-bold text-lg mb-4">{s.step}</div>
                  <h4 className="text-xl font-bold mb-3">{s.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: "200+", lbl: "Enterprise Projects" },
              { val: "99.9%", lbl: "System Uptime" },
              { val: "40%", lbl: "Performance Boost" },
              { val: "$25k+", lbl: "Min. Project Value" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">{stat.val}</div>
                <div className="text-muted-foreground uppercase tracking-widest text-xs font-heading">{stat.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ & Final CTA */}
        <section className="py-24 px-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "Why choose FouriqTech as your Next.js development agency?", a: "We combine elite design with senior-level engineering, ensuring your product is built to handle enterprise-level scale." },
                { q: "Can you handle complex legacy migrations?", a: "Yes. We are specialized in moving complex, data-heavy systems from legacy frameworks to high-performance architectures." },
                { q: "What is the typical timeline for an enterprise engagement?", a: "We operate on multi-month roadmaps to ensure rigorous testing and high-quality delivery." }
              ].map((faq, i) => (
                <div key={i} className="bg-background/50 border border-white/5 p-8 rounded-2xl">
                  <h4 className="text-lg font-bold mb-3 text-primary">{faq.q}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-5xl font-bold mb-8">Ready to Architect Your Digital Future?</h2>
            <p className="text-xl text-muted-foreground mb-10">Stop settling for performance bottlenecks. Partner with an agency that understands the intersection of high-end design and scalable enterprise engineering.</p>
            <a href="/#contact">
              <button className="py-4 px-10 bg-primary text-primary-foreground font-heading font-bold rounded-xl text-lg hover:bg-white transition-all">
                Schedule Your Consultation
              </button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}