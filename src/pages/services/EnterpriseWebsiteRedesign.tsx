import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';
import { 
  AlertTriangle, Clock, ShieldAlert, Palette, TrendingUp, Database, 
  ArrowUpRight, BarChart3, ChevronDown, CheckCircle2, Zap 
} from 'lucide-react';

export default function EnterpriseWebsiteRedesign() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO 
        title="Enterprise Website Redesign Services | Premium B2B Solutions" 
        description="Drive growth with FouriqTech's elite enterprise website redesign services. We specialize in high-performance, conversion-focused B2B digital experiences." 
        url="https://fouriqtech.com/services/enterprise-website-redesign" 
      />
      <Navbar isVisible={navVisible} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-8">
                Transform Your Digital Presence with Expert <br />
                <span className="text-gradient">Enterprise Website Redesign Services</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                FouriqTech empowers global organizations to modernize their digital architecture. 
                We combine luxury UI/UX design with high-performance engineering to turn your 
                web presence into a scalable revenue engine.
              </p>
              <div className="flex justify-center">
                <a href="/#contact" className="py-4 px-10 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box flex items-center gap-2 hover:opacity-90 transition-all">
                  Request A Strategic Audit <ArrowUpRight size={20} />
                </a>
              </div>
              <p className="mt-8 text-sm text-muted-foreground tracking-widest uppercase">
                ✦ Trusted by 50+ enterprise brands to deliver high-scale digital transformation
              </p>
            </motion.div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">Is Your Digital Infrastructure Holding You Back?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: AlertTriangle, title: "Stagnant Conversion Rates", desc: "Legacy interfaces often fail to convert high-intent traffic, leading to massive missed opportunities in your marketing funnel." },
                { icon: Clock, title: "Slow Performance Bottlenecks", desc: "Bloated enterprise CMS architectures lead to latency that kills SEO rankings and frustrates high-value B2B prospects." },
                { icon: ShieldAlert, title: "Technical Debt & Risk", desc: "Outdated frameworks expose your corporate entity to security vulnerabilities and prevent seamless integration with modern SaaS APIs." }
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 rounded-3xl border border-white/5">
                  <item.icon className="text-primary mb-6" size={40} />
                  <h3 className="font-display text-2xl mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-24 bg-muted/20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">Our Approach to Enterprise Transformation</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Palette, title: "Premium SaaS Website Redesign", desc: "We craft bespoke, high-end interfaces that align with your brand equity, ensuring your visual identity mirrors your market authority." },
                { icon: TrendingUp, title: "Conversion Focused Website Redesign", desc: "Every pixel is engineered for engagement. We utilize behavioral data to build conversion paths that consistently turn visitors into qualified leads." },
                { icon: Database, title: "Enterprise CMS Migration", desc: "Seamlessly transition your complex content ecosystems to modern, robust stacks without losing historical authority or data integrity." }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 hover:border-primary/45 transition-all">
                  <item.icon size={48} className="text-primary mb-6" />
                  <h3 className="text-2xl font-display mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">The FouriqTech Roadmap to Success</h2>
            <div className="space-y-6">
              {[
                { s: "01", t: "Discovery & Strategy", d: "We analyze your existing metrics, pain points, and business goals to architect a redesign strategy tailored for enterprise scalability." },
                { s: "02", t: "Luxury UI/UX Design", d: "Creating high-fidelity, interactive prototypes that capture the essence of your brand while optimizing for user journeys." },
                { s: "03", t: "Custom Web Development", d: "Engineered with React, Next.js, and TypeScript, we build lightning-fast web applications designed for high-traffic environments." },
                { s: "04", t: "Launch & Optimization", d: "Post-launch, we monitor performance metrics and iterate using data-driven insights to ensure sustained ROI and growth." }
              ].map((step, i) => (
                <div key={i} className="flex gap-8 p-8 border-b border-white/10">
                  <span className="text-4xl font-display text-primary/30 font-bold">{step.s}</span>
                  <div>
                    <h3 className="text-2xl font-display mb-2">{step.t}</h3>
                    <p className="text-muted-foreground">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto glass-modern p-16 rounded-[2rem] text-center">
            <h2 className="font-display text-5xl font-bold mb-6">Ready to Redefine Your Enterprise Digital Strategy?</h2>
            <p className="text-xl text-muted-foreground mb-10">Don't settle for average results. Join the elite businesses working with FouriqTech to lead their industries.</p>
            <a href="/#contact" className="inline-flex items-center gap-3 py-4 px-10 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-transform">
              Start Your Transformation <Zap size={20} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}