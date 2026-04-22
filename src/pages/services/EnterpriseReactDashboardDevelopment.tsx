import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
import { 
  AlertTriangle, ShieldAlert, LayoutDashboard, Zap, Code2, 
  GitBranch, ArrowUpRight, BarChart3, Clock, ShieldCheck, 
  Database, Users, ChevronDown 
} from 'lucide-react';

export default function EnterpriseReactDashboardDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  
  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      <SEO 
        title="Enterprise React Dashboard Development | FouriqTech" 
        description="We are a premier enterprise react dashboard development agency. Build high-performance, scalable custom SaaS dashboards with our expert team." 
        url="https://fouriqtech.com/services/enterprise-react-dashboard-development" 
      />
      <Navbar isVisible={navVisible} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.span 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]"
            >
              Enterprise React Dashboard Development Agency
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-bold mt-6 mb-8"
            >
              High-Performance <span className="text-gradient">Enterprise React</span><br />Dashboard Development
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-muted-foreground text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              We engineer robust, data-driven web applications designed for the scale and complexity of modern enterprise SaaS platforms. Transform your complex data architecture into a seamless, intuitive, and high-velocity user experience.
            </motion.p>
            <motion.a 
              href="/#contact"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex py-4 px-10 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box items-center gap-2"
            >
              Get a Free Architecture Consultation <ArrowUpRight size={18} />
            </motion.a>
            <p className="mt-8 text-sm text-muted-foreground font-medium italic">
              ✦ Trusted by 50+ Global Enterprises & Scaling SaaS Platforms
            </p>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-32 px-6 bg-[#09090b]">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-20">
              The Hidden Costs of <span className="text-gradient">Technical Debt</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: AlertTriangle, title: "Unoptimized Rendering", desc: "Complex data visualization often triggers performance bottlenecks, causing laggy interfaces that frustrate power users." },
                { icon: ShieldAlert, title: "Scalability Roadblocks", desc: "Hard-coded architectures fail when your user base hits enterprise-grade volume, leading to costly refactoring cycles." },
                { icon: LayoutDashboard, title: "Fragmented UX", desc: "Inconsistent UI patterns across internal tools result in a steep learning curve, decreasing operational efficiency." }
              ].map((item, i) => (
                <div key={i} className="group glass-card p-10 rounded-3xl border border-white/5 bg-zinc-900/30">
                  <item.icon size={40} className="text-primary mb-6" />
                  <h3 className="font-display text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-16">
              Custom React Enterprise <br/><span className="text-gradient">Dashboard Solutions</span>
            </h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: "Data-Dense Visualization", desc: "Utilizing WebGL and D3 to render thousands of data points without compromising frame rates." },
                { icon: Code2, title: "Enterprise-Grade Architecture", desc: "Modular micro-frontends and type-safe infrastructure to ensure long-term maintainability." },
                { icon: GitBranch, title: "Refined Lifecycle", desc: "CI/CD and automated testing pipelines to ensure zero-regression deployments at scale." }
              ].map((sol, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <sol.icon size={38} className="text-primary mb-8" />
                    <h3 className="font-display text-3xl font-bold mb-5">{sol.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{sol.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-24 border-t border-white/5 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-primary font-heading uppercase tracking-widest text-sm mb-12">Cutting-Edge Development Toolkit</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {['React', 'Next.js', 'TypeScript', 'GSAP', 'Framer Motion', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'Recharts'].map((tech) => (
                <span key={tech} className="px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:border-primary transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "What is the typical timeline?", a: "For most enterprise dashboards, the discovery and delivery process takes 8-16 weeks depending on data integration complexity." },
                { q: "Do you handle codebase migrations?", a: "Yes, we specialize in upgrading legacy architectures into modern, performant React ecosystems." },
                { q: "Are solutions GDPR/HIPAA compliant?", a: "We adhere strictly to modern security standards, implementing robust authentication and encryption patterns." }
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <h4 className="font-display text-lg font-semibold mb-3 flex items-center justify-between">
                    {faq.q} <ChevronDown className="text-primary" size={20} />
                  </h4>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto glass p-20 rounded-[3rem] border border-primary/20">
            <h2 className="font-display text-5xl font-bold mb-8">Ready to Transform Your SaaS Infrastructure?</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Partner with the agency that blends elite design with high-scale engineering. Let's schedule a consultation to discuss your specific dashboard requirements.
            </p>
            <a href="/#contact" className="inline-flex py-4 px-12 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box">
              Start Your Project
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}