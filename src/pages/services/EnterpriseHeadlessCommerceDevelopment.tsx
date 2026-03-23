import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ZapOff, 
  Lock, 
  TrendingDown, 
  Layers, 
  Cpu, 
  Globe, 
  ArrowUpRight, 
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-xl font-heading font-medium group-hover:text-primary transition-colors">
          {question}
        </span>
        <div className={`p-2 rounded-full border border-white/10 group-hover:border-primary/40 transition-all ${isOpen ? 'bg-primary text-black' : ''}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-8 text-muted-foreground leading-relaxed max-w-3xl">
          {answer}
        </p>
      </motion.div>
    </div>
  );
};

export default function EnterpriseHeadlessCommerceDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-20">
      <SEO 
        title="Enterprise Headless Commerce Development Services | FouriqTech" 
        description="Scale globally with our custom headless storefront development and high-performance retail platforms. Next.js experts for enterprise-level ecommerce."
        url="https://fouriqtech.com/services/enterprise-headless-commerce-development"
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section ref={heroRef} className="relative py-24 md:py-32 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.08] rounded-full blur-[120px] liquid-blob -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.05] rounded-full blur-[100px] liquid-blob translate-y-1/2 -translate-x-1/2" />
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-primary text-sm font-heading font-medium uppercase tracking-[0.3em] block mb-6"
            >
              ✦ Premium E-commerce Solutions
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-5xl md:text-7xl font-bold mb-8 leading-[1.1]"
            >
              Transform Your Retail Experience with <br className="hidden md:block" />
              <span className="text-gradient">Enterprise Headless Commerce</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Break free from monolithic constraints. We build ultra-fast, decoupled storefronts that empower CTOs to scale globally while delivering the luxury UI/UX your brand deserves.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <motion.a
                href="/#contact"
                whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="py-4 px-10 bg-primary text-primary-foreground font-heading font-bold rounded-xl glow-box flex items-center gap-2 group transition-all"
              >
                Schedule a Strategy Call <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </motion.a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
                  ))}
                </div>
                <span>Trusted by Fortune 500 retail partners.</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROBLEMS SECTION */}
        <section className="py-24 px-6 bg-muted/30 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                ✦ The Challenge
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
                The Hidden Costs of <span className="text-gradient">Legacy E-commerce</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: ZapOff, title: "Sluggish Page Load Speeds", desc: "Every millisecond lost in a monolithic architecture costs millions in conversions. Legacy systems can't compete." },
                { icon: Lock, title: "Platform Lock-in", desc: "Being tethered to a single provider's frontend limitations stifles innovation and prevents a true omnichannel experience." },
                { icon: TrendingDown, title: "Scaling Fragility", desc: "Legacy databases and coupled frontends often buckle under the pressure of peak global demand like Black Friday." }
              ].map((item, i) => (
                <div key={i} className="glass-card p-10 group transition-all hover:-translate-y-2">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-black transition-colors">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS SECTION */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
                  ✦ Our Solution
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-8">
                  Modern Architecture for <br />
                  <span className="text-gradient">Global Leaders</span>
                </h2>
                <div className="space-y-10">
                  {[
                    { icon: Layers, title: "Custom Headless Storefront Development", desc: "We decouple your frontend from the backend, allowing for complete creative freedom and lightning-fast interactions." },
                    { icon: Cpu, title: "Next.js Ecommerce Agency for Enterprise", desc: "Leveraging Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR) to ensure product pages are always fresh." },
                    { icon: Globe, title: "Scalable Ecommerce for Global Brands", desc: "Architecting multi-region deployments that ensure a consistent shopping experience in the USA, UK, and Middle East." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-primary">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-xl font-heading font-bold mb-2">{item.title}</h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden glass border-white/5 flex items-center justify-center">
                   {/* Abstract illustration or code block */}
                   <div className="p-8 font-mono text-sm leading-relaxed text-primary/80">
                      <code>
                        <span className="text-purple-400">const</span> <span className="text-blue-400">Storefront</span> = <span className="text-yellow-400">()</span> {"=>"} <span className="text-yellow-400">{`({`}</span> <br />
                        &nbsp;&nbsp;<span className="text-accent">headless:</span> <span className="text-primary">true</span>,<br />
                        &nbsp;&nbsp;<span className="text-accent">provider:</span> <span className="text-gold-light">"Commercetools"</span>,<br />
                        &nbsp;&nbsp;<span className="text-accent">delivery:</span> <span className="text-gold-light">"Edge-First"</span>,<br />
                        &nbsp;&nbsp;<span className="text-accent">animations:</span> <span className="text-gold-light">"GSAP"</span>,<br />
                        &nbsp;&nbsp;<span className="text-accent">performance:</span> <span className="text-gold-light">"Luxury Grade"</span><br />
                        <span className="text-yellow-400">{`})`}</span>;
                      </code>
                   </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section className="py-24 px-6 bg-[#0a0a0d] relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Our Enterprise <span className="text-gradient">Deployment Roadmap</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Strategic Discovery", desc: "We audit your current tech stack and map out a migration strategy that minimizes downtime." },
                { step: "02", title: "Architecture Design", desc: "Selecting the right Head (Next.js) and Body (Shopify Plus, or Commercetools) for your logic." },
                { step: "03", title: "Engineering", desc: "Our developers build using TypeScript and GSAP, ensuring a fluid, luxury-grade user interface." },
                { step: "04", title: "Global Launch", desc: "Launching on Vercel Edge CDN with rigorous automated testing and 99.9% uptime guarantees." }
              ].map((item, i) => (
                <div key={i} className="relative pt-12">
                  <span className="absolute top-0 left-0 font-display text-6xl font-black text-white/[0.03] select-none">
                    {item.step}
                  </span>
                  <div className="relative">
                    <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-3">
                      <span className="w-8 h-1 bg-primary rounded-full" />
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TECH STACK */}
        <section className="py-24 px-6 border-y border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm font-heading font-medium text-muted-foreground uppercase tracking-widest mb-10">The Enterprise Headless Stack</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-60">
              {["Next.js", "React", "TypeScript", "Shopify Plus", "BigCommerce", "Contentful", "Vercel", "Stripe", "GSAP", "Tailwind CSS"].map(tech => (
                <span key={tech} className="text-2xl md:text-3xl font-display font-medium grayscale hover:grayscale-0 hover:text-primary transition-all cursor-default">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto glass rounded-[40px] p-12 md:p-24 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/[0.05] to-transparent" />
             <div className="relative z-10">
                <div className="text-center mb-16">
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Driving Real Business Impact</h2>
                  <p className="text-muted-foreground">Measurable success across our portfolio</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                  {[
                    { v: "45%", l: "Increase in Conversion" },
                    { v: "< 500ms", l: "Core Web Vital LCP" },
                    { v: "$25k+", l: "Standard Project" },
                    { v: "100%", l: "Peak Scaling Uptime" }
                  ].map((m, i) => (
                    <div key={i} className="text-center">
                      <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2 italic tracking-tighter">{m.v}</div>
                      <div className="text-sm uppercase tracking-wider text-muted-foreground font-heading">{m.l}</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-32 px-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16 text-center">Expert Insights on <span className="text-gradient">Headless Commerce</span></h2>
            <div className="space-y-2">
              <FAQItem 
                question="Why is Headless Commerce better for SEO?" 
                answer="By using Next.js for your enterprise headless commerce development services, we achieve near-perfect Lighthouse scores, which Google prioritizes in Search Engine Results Pages (SERPs). Sub-second load times lead to higher crawl rates and better rankings." 
              />
              <FAQItem 
                question="Can we keep our existing backend like Shopify or BigCommerce?" 
                answer="Absolutely. As a specialized Next.js ecommerce agency for enterprise, we connect your existing backend data via APIs to a custom-built, high-performance frontend. You retain your inventory systems while significantly upgrading your user experience." 
              />
              <FAQItem 
                question="What is the typical timeline for a headless migration?" 
                answer="Enterprise-level projects typically range from 3 to 6 months depending on the complexity of your custom business logic and integration requirements. However, we offer phased rollouts to ensure immediate impact." 
              />
              <FAQItem 
                question="How do you handle global currencies and localized content?" 
                answer="We implement scalable ecommerce architecture for global brands using middleware that detects user location and serves localized content and pricing instantly at the edge, ensuring zero latency." 
              />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
             <h2 className="font-display text-5xl md:text-6xl font-bold mb-8 italic">Ready to Future-Proof Your <br />Retail Empire?</h2>
             <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
               Don't let legacy tech hold back your global growth. Let's build the high-performance platform your brand deserves.
             </p>
             <motion.a
                href="/#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex py-5 px-12 bg-primary text-primary-foreground font-heading font-extrabold text-lg rounded-full glow-box shadow-primary/20 shadow-2xl transition-all"
              >
                Request a Technical Audit
              </motion.a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
